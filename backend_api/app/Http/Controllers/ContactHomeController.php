<?php

namespace App\Http\Controllers;

use App\Models\ContactHome;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\File;
use Exception;

class ContactHomeController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum')->except(['index', 'show', 'contactHomeSlider']);
    }

    public function index()
    {
        try {
            \Log::info('Fetching all contact home sliders');
            $sliders = ContactHome::orderBy('cont_home_id', 'desc')->get();
            \Log::info('Retrieved sliders: ', ['count' => $sliders->count()]);
            return response()->json($sliders, Response::HTTP_OK);
        } catch (Exception $e) {
            \Log::error('Error fetching contact home sliders: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch contact home sliders', 'details' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function contactHomeSlider()
    {
        try {
            \Log::info('Fetching all contact home sliders for public view');
            $sliders = ContactHome::orderBy('cont_home_id', 'desc')->get();
            \Log::info('Retrieved sliders: ', ['count' => $sliders->count()]);
            return response()->json($sliders, Response::HTTP_OK);
        } catch (Exception $e) {
            \Log::error('Error fetching contact home sliders: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch contact home sliders', 'details' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function store(Request $request)
    {
        \Log::info('Contact home slider store request data: ', $request->all());

        $validator = Validator::make($request->all(), [
            'description' => 'nullable|string',
            'heading' => 'nullable|string|max:255',
            'home_img' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($validator->fails()) {
            \Log::warning('Validation failed for contact home slider store: ', $validator->errors()->toArray());
            return response()->json(['errors' => $validator->errors()], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        try {
            $validatedData = $validator->validated();

            if ($request->hasFile('home_img')) {
                $image = $request->file('home_img');
                $originalName = pathinfo($image->getClientOriginalName(), PATHINFO_FILENAME);
                $sanitizedName = preg_replace('/[^A-Za-z0-9_.-]+/', '_', $originalName);
                $imageName = time() . '-' . $sanitizedName . '.' . $image->getClientOriginalExtension();

                $destinationFolder = 'Uploads/contact_home';
                $publicDestinationPath = public_path($destinationFolder);

                if (!File::isDirectory($publicDestinationPath)) {
                    File::makeDirectory($publicDestinationPath, 0755, true);
                }

                $image->move($publicDestinationPath, $imageName);
                $validatedData['home_img'] = $destinationFolder . '/' . $imageName;
                \Log::info('Contact home slider image uploaded: ' . $validatedData['home_img']);
            }

            $slider = ContactHome::create($validatedData);
            \Log::info('Contact home slider created successfully: ', $slider->toArray());
            return response()->json(['message' => 'Contact home slider created successfully', 'slider' => $slider], Response::HTTP_CREATED);
        } catch (Exception $e) {
            \Log::error('Error creating contact home slider: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create contact home slider', 'details' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function show(ContactHome $contactHome)
    {
        \Log::info('Fetching contact home slider with ID: ' . $contactHome->cont_home_id);
        try {
            return response()->json($contactHome, Response::HTTP_OK);
        } catch (Exception $e) {
            \Log::error('Error fetching contact home slider for ID ' . $contactHome->cont_home_id . ': ' . $e->getMessage());
            return response()->json(['error' => 'Failed to retrieve contact home slider', 'details' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function update(Request $request, ContactHome $contactHome)
{
    \Log::info('Contact home slider update request data for ID ' . $contactHome->cont_home_id . ': ', $request->all());

    $validator = Validator::make($request->all(), [
        'description' => 'nullable|string',
        'heading' => 'nullable|string|max:255',
        'home_img' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
    ]);

    if ($validator->fails()) {
        \Log::warning('Validation failed for contact home slider update ID ' . $contactHome->cont_home_id . ': ', $validator->errors()->toArray());
        return response()->json(['errors' => $validator->errors()], Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    try {
        $validatedData = $validator->validated();

        if ($request->hasFile('home_img')) {
            $image = $request->file('home_img');
            if ($image->getError() !== UPLOAD_ERR_OK) {
                \Log::warning('File upload error for contact home slider ID ' . $contactHome->cont_home_id . ': ' . $image->getErrorMessage());
                return response()->json(['error' => 'File upload failed'], Response::HTTP_BAD_REQUEST);
            }

            // Delete old image if it exists
            if ($contactHome->home_img) {
                $oldImagePath = public_path($contactHome->home_img);
                if (File::exists($oldImagePath)) {
                    File::delete($oldImagePath);
                    \Log::info('Deleted old contact home slider image: ' . $oldImagePath);
                } else {
                    \Log::warning('Old contact home slider image not found for deletion: ' . $oldImagePath);
                }
            }

            // Upload new image
            $originalName = pathinfo($image->getClientOriginalName(), PATHINFO_FILENAME);
            $sanitizedName = preg_replace('/[^A-Za-z0-9_.-]+/', '_', $originalName);
            $imageName = time() . '-' . $sanitizedName . '.' . $image->getClientOriginalExtension();

            $destinationFolder = 'Uploads/contact_home';
            $publicDestinationPath = public_path($destinationFolder);

            if (!File::isDirectory($publicDestinationPath)) {
                File::makeDirectory($publicDestinationPath, 0755, true);
            }

            $image->move($publicDestinationPath, $imageName);
            $validatedData['home_img'] = $destinationFolder . '/' . $imageName;
            \Log::info('New contact home slider image uploaded: ' . $validatedData['home_img']);
        }

        // Update only the provided fields, preserving existing image if no new image is uploaded
        $contactHome->fill($validatedData)->save();
        \Log::info('Contact home slider updated successfully for ID: ' . $contactHome->cont_home_id);

        return response()->json([
            'message' => 'Contact home slider updated successfully',
            'slider' => $contactHome->fresh()
        ], Response::HTTP_OK);
    } catch (Exception $e) {
        \Log::error('Error updating contact home slider for ID ' . $contactHome->cont_home_id . ': ' . $e->getMessage());
        return response()->json(['error' => 'Failed to update contact home slider', 'details' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
    }
}

    public function destroy(ContactHome $contactHome)
    {
        \Log::info('Attempting to delete contact home slider with ID: ' . $contactHome->cont_home_id);

        try {
            if ($contactHome->home_img) {
                $imagePath = public_path($contactHome->home_img);
                if (File::exists($imagePath)) {
                    File::delete($imagePath);
                    \Log::info('Deleted contact home slider image: ' . $imagePath);
                } else {
                    \Log::warning('Contact home slider image not found for deletion: ' . $imagePath);
                }
            }

            $contactHome->delete();
            \Log::info('Contact home slider deleted successfully for ID: ' . $contactHome->cont_home_id);
            return response()->json(['message' => 'Contact home slider deleted successfully'], Response::HTTP_NO_CONTENT);
        } catch (Exception $e) {
            \Log::error('Error deleting contact home slider for ID ' . $contactHome->cont_home_id . ': ' . $e->getMessage());
            return response()->json(['error' => 'Failed to delete contact home slider', 'details' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}