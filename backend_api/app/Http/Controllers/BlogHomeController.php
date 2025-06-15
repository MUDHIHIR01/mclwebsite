<?php

namespace App\Http\Controllers;

use App\Models\BlogHome;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\File;
use Exception;

class BlogHomeController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum')->except(['index', 'show', 'blogHomeSlider']);
    }

    public function index()
    {
        try {
            \Log::info('Fetching all blog home sliders');
            $sliders = BlogHome::orderBy('blog_home_id', 'desc')->get();
            \Log::info('Retrieved sliders: ', ['count' => $sliders->count()]);
            return response()->json($sliders, Response::HTTP_OK);
        } catch (Exception $e) {
            \Log::error('Error fetching blog home sliders: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch blog home sliders', 'details' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function blogHomeSlider()
    {
        try {
            \Log::info('Fetching all blog home sliders for public view');
            $sliders = BlogHome::orderBy('blog_home_id', 'desc')->get();
            \Log::info('Retrieved sliders: ', ['count' => $sliders->count()]);
            return response()->json($sliders, Response::HTTP_OK);
        } catch (Exception $e) {
            \Log::error('Error fetching blog home sliders: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch blog home sliders', 'details' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function store(Request $request)
    {
        \Log::info('Blog home slider store request data: ', $request->all());

        $validator = Validator::make($request->all(), [
            'description' => 'nullable|string',
            'heading' => 'nullable|string|max:255',
            'home_img' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($validator->fails()) {
            \Log::warning('Validation failed for blog home slider store: ', $validator->errors()->toArray());
            return response()->json(['errors' => $validator->errors()], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        try {
            $validatedData = $validator->validated();

            if ($request->hasFile('home_img')) {
                $image = $request->file('home_img');
                $originalName = pathinfo($image->getClientOriginalName(), PATHINFO_FILENAME);
                $sanitizedName = preg_replace('/[^A-Za-z0-9_.-]+/', '_', $originalName);
                $imageName = time() . '_' . $sanitizedName . '.' . $image->getClientOriginalExtension();

                $destinationFolder = 'uploads/blog_homes';
                $publicDestinationPath = public_path($destinationFolder);

                if (!File::isDirectory($publicDestinationPath)) {
                    File::makeDirectory($publicDestinationPath, 0755, true);
                }

                $image->move($publicDestinationPath, $imageName);
                $validatedData['home_img'] = $destinationFolder . '/' . $imageName;
                \Log::info('Blog home slider image uploaded: ' . $validatedData['home_img']);
            }

            $slider = BlogHome::create($validatedData);
            \Log::info('Blog home slider created successfully: ', $slider->toArray());
            return response()->json(['message' => 'Blog home slider created successfully', 'slider' => $slider], Response::HTTP_CREATED);
        } catch (Exception $e) {
            \Log::error('Error creating blog home slider: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create blog home slider', 'details' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function show($blog_home_id)
    {
        \Log::info('Fetching blog home slider with ID: ' . $blog_home_id);
        try {
            $slider = BlogHome::findOrFail($blog_home_id);
            \Log::info('Blog home slider found: ', $slider->toArray());
            return response()->json($slider, Response::HTTP_OK);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            \Log::warning('Blog home slider not found for ID: ' . $blog_home_id);
            return response()->json(['error' => 'Blog home slider not found'], Response::HTTP_NOT_FOUND);
        } catch (Exception $e) {
            \Log::error('Error fetching blog home slider for ID ' . $blog_home_id . ': ' . $e->getMessage());
            return response()->json(['error' => 'Failed to retrieve blog home slider', 'details' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function update(Request $request, $blog_home_id)
    {
        \Log::info('Blog home slider update request data for ID ' . $blog_home_id . ': ', $request->all());

        $slider = BlogHome::find($blog_home_id);
        if (!$slider) {
            \Log::warning('Blog home slider not found for update, ID: ' . $blog_home_id);
            return response()->json(['error' => 'Blog home slider not found'], Response::HTTP_NOT_FOUND);
        }

        $validator = Validator::make($request->all(), [
            'description' => 'nullable|string',
            'heading' => 'nullable|string|max:255',
            'home_img' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($validator->fails()) {
            \Log::warning('Validation failed for blog home slider update ID ' . $blog_home_id . ': ', $validator->errors()->toArray());
            return response()->json(['errors' => $validator->errors()], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        try {
            $validatedData = $validator->validated();

            if ($request->hasFile('home_img')) {
                $image = $request->file('home_img');
                if ($image->getError() !== UPLOAD_ERR_OK) {
                    \Log::warning('File upload error for blog home slider ID ' . $blog_home_id . ': ' . $image->getErrorMessage());
                    return response()->json(['error' => 'File upload failed'], Response::HTTP_BAD_REQUEST);
                }

                if ($slider->home_img) {
                    $oldImagePath = public_path($slider->home_img);
                    if (File::exists($oldImagePath)) {
                        File::delete($oldImagePath);
                        \Log::info('Deleted old blog home slider image: ' . $oldImagePath);
                    } else {
                        \Log::warning('Old blog home slider image not found for deletion: ' . $oldImagePath);
                    }
                }

                $originalName = pathinfo($image->getClientOriginalName(), PATHINFO_FILENAME);
                $sanitizedName = preg_replace('/[^A-Za-z0-9_.-]+/', '_', $originalName);
                $imageName = time() . '_' . $sanitizedName . '.' . $image->getClientOriginalExtension();

                $destinationFolder = 'uploads/blog_homes';
                $publicDestinationPath = public_path($destinationFolder);

                if (!File::isDirectory($publicDestinationPath)) {
                    File::makeDirectory($publicDestinationPath, 0755, true);
                }

                $image->move($publicDestinationPath, $imageName);
                $validatedData['home_img'] = $destinationFolder . '/' . $imageName;
                \Log::info('New blog home slider image uploaded: ' . $validatedData['home_img']);
            } elseif (array_key_exists('home_img', $validatedData) && $validatedData['home_img'] === null) {
                if ($slider->home_img) {
                    $oldImagePath = public_path($slider->home_img);
                    if (File::exists($oldImagePath)) {
                        File::delete($oldImagePath);
                        \Log::info('Deleted existing blog home slider image (null input): ' . $oldImagePath);
                    } else {
                        \Log::warning('Existing blog home slider image not found for deletion (null input): ' . $oldImagePath);
                    }
                    $validatedData['home_img'] = null;
                }
                \Log::info('Blog home slider image field set to null');
            } else {
                \Log::info('No new image uploaded or null specified, preserving existing image: ' . ($slider->home_img ?: 'none'));
            }

            $slider->fill($validatedData)->save();
            \Log::info('Blog home slider updated successfully for ID: ' . $blog_home_id);

            return response()->json([
                'message' => 'Blog home slider updated successfully',
                'slider' => $slider->fresh()
            ], Response::HTTP_OK);
        } catch (Exception $e) {
            \Log::error('Error updating blog home slider for ID ' . $blog_home_id . ': ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update blog home slider', 'details' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function destroy($blog_home_id)
    {
        $slider = BlogHome::find($blog_home_id);
        if (!$slider) {
            \Log::warning('Blog home slider not found for deletion, ID: ' . $blog_home_id);
            return response()->json(['error' => 'Blog home slider not found'], Response::HTTP_NOT_FOUND);
        }

        try {
            if ($slider->home_img) {
                $imagePath = public_path($slider->home_img);
                if (File::exists($imagePath)) {
                    File::delete($imagePath);
                    \Log::info('Deleted blog home slider image: ' . $imagePath);
                } else {
                    \Log::warning('Blog home slider image not found for deletion: ' . $imagePath);
                }
            }

            $slider->delete();
            \Log::info('Blog home slider deleted successfully for ID: ' . $blog_home_id);
            return response()->json(['message' => 'Blog home slider deleted successfully'], Response::HTTP_NO_CONTENT);
        } catch (Exception $e) {
            \Log::error('Error deleting blog home slider for ID ' . $blog_home_id . ': ' . $e->getMessage());
            return response()->json(['error' => 'Failed to delete blog home slider', 'details' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}