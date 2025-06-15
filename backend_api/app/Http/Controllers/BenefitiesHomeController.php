<?php

namespace App\Http\Controllers;

use App\Models\BenefitiesHome;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\File;
use Exception;

class BenefitiesHomeController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum')->except(['index', 'show', 'benefitiesHomeSlider']);
    }

    /**
     * Display a listing of benefities home sliders.
     */
    public function index()
    {
        try {
            \Log::info('Fetching all benefities home sliders');
            $sliders = BenefitiesHome::orderBy('benefit_home_id', 'desc')->get();
            \Log::info('Retrieved sliders: ', ['count' => $sliders->count()]);
            return response()->json($sliders, Response::HTTP_OK);
        } catch (Exception $e) {
            \Log::error('Error fetching benefities home sliders: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch benefities home sliders', 'details' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Display benefities home sliders for public view.
     */
    public function benefitiesHomeSlider()
    {
        try {
            \Log::info('Fetching all benefities home sliders for public view');
            $sliders = BenefitiesHome::orderBy('benefit_home_id', 'desc')->get();
            \Log::info('Retrieved sliders: ', ['count' => $sliders->count()]);
            return response()->json($sliders, Response::HTTP_OK);
        } catch (Exception $e) {
            \Log::error('Error fetching benefities home sliders: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch benefities home sliders', 'details' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Store a newly created benefities home slider.
     */
    public function store(Request $request)
    {
        \Log::info('Benefities home slider store request data: ', $request->all());

        $validator = Validator::make($request->all(), [
            'description' => 'nullable|string',
            'heading' => 'nullable|string|max:255',
            'home_img' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($validator->fails()) {
            \Log::warning('Validation failed for benefities home slider store: ', $validator->errors()->toArray());
            return response()->json(['errors' => $validator->errors()], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        try {
            $validatedData = $validator->validated();

            if ($request->hasFile('home_img')) {
                $image = $request->file('home_img');
                $originalName = pathinfo($image->getClientOriginalName(), PATHINFO_FILENAME);
                $sanitizedName = preg_replace('/[^A-Za-z0-9_.-]+/', '_', $originalName);
                $imageName = time() . '_' . $sanitizedName . '.' . $image->getClientOriginalExtension();

                $destinationFolder = 'uploads/benefities_homes';
                $publicDestinationPath = public_path($destinationFolder);

                if (!File::isDirectory($publicDestinationPath)) {
                    File::makeDirectory($publicDestinationPath, 0755, true);
                }

                $image->move($publicDestinationPath, $imageName);
                $validatedData['home_img'] = $destinationFolder . '/' . $imageName;
                \Log::info('Benefities home slider image uploaded: ' . $validatedData['home_img']);
            }

            $slider = BenefitiesHome::create($validatedData);
            \Log::info('Benefities home slider created successfully: ', $slider->toArray());
            return response()->json(['message' => 'Benefities home slider created successfully', 'slider' => $slider], Response::HTTP_CREATED);
        } catch (Exception $e) {
            \Log::error('Error creating benefities home slider: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create benefities home slider', 'details' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Display the specified benefities home slider.
     */
    public function show($benefit_home_id)
    {
        \Log::info('Fetching benefities home slider with ID: ' . $benefit_home_id);
        try {
            $slider = BenefitiesHome::findOrFail($benefit_home_id);
            \Log::info('Benefities home slider found: ', $slider->toArray());
            return response()->json($slider, Response::HTTP_OK);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            \Log::warning('Benefities home slider not found for ID: ' . $benefit_home_id);
            return response()->json(['error' => 'Benefities home slider not found'], Response::HTTP_NOT_FOUND);
        } catch (Exception $e) {
            \Log::error('Error fetching benefities home slider for ID ' . $benefit_home_id . ': ' . $e->getMessage());
            return response()->json(['error' => 'Failed to retrieve benefities home slider', 'details' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Update the specified benefities home slider.
     */
    public function update(Request $request, $benefit_home_id)
    {
        \Log::info('Benefities home slider update request data for ID ' . $benefit_home_id . ': ', $request->all());

        $slider = BenefitiesHome::find($benefit_home_id);
        if (!$slider) {
            \Log::warning('Benefities home slider not found for update, ID: ' . $benefit_home_id);
            return response()->json(['error' => 'Benefities home slider not found'], Response::HTTP_NOT_FOUND);
        }

        $validator = Validator::make($request->all(), [
            'description' => 'nullable|string',
            'heading' => 'nullable|string|max:255',
            'home_img' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($validator->fails()) {
            \Log::warning('Validation failed for benefities home slider update ID ' . $benefit_home_id . ': ', $validator->errors()->toArray());
            return response()->json(['errors' => $validator->errors()], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        try {
            $validatedData = $validator->validated();

            if ($request->hasFile('home_img')) {
                $image = $request->file('home_img');
                if ($image->getError() !== UPLOAD_ERR_OK) {
                    \Log::warning('File upload error for benefities home slider ID ' . $benefit_home_id . ': ' . $image->getErrorMessage());
                    return response()->json(['error' => 'File upload failed'], Response::HTTP_BAD_REQUEST);
                }

                if ($slider->home_img) {
                    $oldImagePath = public_path($slider->home_img);
                    if (File::exists($oldImagePath)) {
                        File::delete($oldImagePath);
                        \Log::info('Deleted old benefities home slider image: ' . $oldImagePath);
                    } else {
                        \Log::warning('Old benefities home slider image not found for deletion: ' . $oldImagePath);
                    }
                }

                $originalName = pathinfo($image->getClientOriginalName(), PATHINFO_FILENAME);
                $sanitizedName = preg_replace('/[^A-Za-z0-9_.-]+/', '_', $originalName);
                $imageName = time() . '_' . $sanitizedName . '.' . $image->getClientOriginalExtension();

                $destinationFolder = 'uploads/benefities_homes';
                $publicDestinationPath = public_path($destinationFolder);

                if (!File::isDirectory($publicDestinationPath)) {
                    File::makeDirectory($publicDestinationPath, 0755, true);
                }

                $image->move($publicDestinationPath, $imageName);
                $validatedData['home_img'] = $destinationFolder . '/' . $imageName;
                \Log::info('New benefities home slider image uploaded: ' . $validatedData['home_img']);
            } elseif (array_key_exists('home_img', $validatedData) && $validatedData['home_img'] === null) {
                if ($slider->home_img) {
                    $oldImagePath = public_path($slider->home_img);
                    if (File::exists($oldImagePath)) {
                        File::delete($oldImagePath);
                        \Log::info('Deleted existing benefities home slider image (null input): ' . $oldImagePath);
                    } else {
                        \Log::warning('Existing benefities home slider image not found for deletion (null input): ' . $oldImagePath);
                    }
                    $validatedData['home_img'] = null;
                }
                \Log::info('Benefities home slider image field set to null');
            } else {
                \Log::info('No new image uploaded or null specified, preserving existing image: ' . ($slider->home_img ?: 'none'));
            }

            $slider->fill($validatedData)->save();
            \Log::info('Benefities home slider updated successfully for ID: ' . $benefit_home_id);

            return response()->json([
                'message' => 'Benefities home slider updated successfully',
                'slider' => $slider->fresh()
            ], Response::HTTP_OK);
        } catch (Exception $e) {
            \Log::error('Error updating benefities home slider for ID ' . $benefit_home_id . ': ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update benefities home slider', 'details' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Remove the specified benefities home slider.
     */
    public function destroy($benefit_home_id)
    {
        $slider = BenefitiesHome::find($benefit_home_id);
        if (!$slider) {
            \Log::warning('Benefities home slider not found for deletion, ID: ' . $benefit_home_id);
            return response()->json(['error' => 'Benefities home slider not found'], Response::HTTP_NOT_FOUND);
        }

        try {
            if ($slider->home_img) {
                $imagePath = public_path($slider->home_img);
                if (File::exists($imagePath)) {
                    File::delete($imagePath);
                    \Log::info('Deleted benefities home slider image: ' . $imagePath);
                } else {
                    \Log::warning('Benefities home slider image not found for deletion: ' . $imagePath);
                }
            }

            $slider->delete();
            \Log::info('Benefities home slider deleted successfully for ID: ' . $benefit_home_id);
            return response()->json(['message' => 'Benefities home slider deleted successfully'], Response::HTTP_NO_CONTENT);
        } catch (Exception $e) {
            \Log::error('Error deleting benefities home slider for ID ' . $benefit_home_id . ': ' . $e->getMessage());
            return response()->json(['error' => 'Failed to delete benefities home slider', 'details' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}