<?php

namespace App\Http\Controllers;

use App\Models\ValuesHome;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\File;
use Exception;

class ValuesHomeController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum')->except(['index', 'show', 'valuesHomeSlider']);
    }

    /**
     * Display a listing of values home sliders.
     */
    public function index()
    {
        try {
            \Log::info('Fetching all values home sliders');
            $sliders = ValuesHome::orderBy('values_home_id', 'desc')->get();
            \Log::info('Retrieved sliders: ', ['count' => $sliders->count()]);
            return response()->json($sliders, Response::HTTP_OK);
        } catch (Exception $e) {
            \Log::error('Error fetching values home sliders: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch values home sliders', 'details' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Display values home sliders for public view.
     */
    public function valuesHomeSlider()
    {
        try {
            \Log::info('Fetching all values home sliders for public view');
            $sliders = ValuesHome::orderBy('values_home_id', 'desc')->get();
            \Log::info('Retrieved sliders: ', ['count' => $sliders->count()]);
            return response()->json($sliders, Response::HTTP_OK);
        } catch (Exception $e) {
            \Log::error('Error fetching values home sliders: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch values home sliders', 'details' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Store a newly created values home slider.
     */
    public function store(Request $request)
    {
        \Log::info('Values home slider store request data: ', $request->all());

        $validator = Validator::make($request->all(), [
            'description' => 'nullable|string',
            'heading' => 'nullable|string|max:255',
            'home_img' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($validator->fails()) {
            \Log::warning('Validation failed for values home slider store: ', $validator->errors()->toArray());
            return response()->json(['errors' => $validator->errors()], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        try {
            $validatedData = $validator->validated();

            if ($request->hasFile('home_img')) {
                $image = $request->file('home_img');
                $originalName = pathinfo($image->getClientOriginalName(), PATHINFO_FILENAME);
                $sanitizedName = preg_replace('/[^A-Za-z0-9_.-]+/', '_', $originalName);
                $imageName = time() . '_' . $sanitizedName . '.' . $image->getClientOriginalExtension();

                $destinationFolder = 'Uploads/values_homes';
                $publicDestinationPath = public_path($destinationFolder);

                if (!File::isDirectory($publicDestinationPath)) {
                    File::makeDirectory($publicDestinationPath, 0755, true);
                }

                $image->move($publicDestinationPath, $imageName);
                $validatedData['home_img'] = $destinationFolder . '/' . $imageName;
                \Log::info('Values home slider image uploaded: ' . $validatedData['home_img']);
            }

            $slider = ValuesHome::create($validatedData);
            \Log::info('Values home slider created successfully: ', $slider->toArray());
            return response()->json(['message' => 'Values home slider created successfully', 'slider' => $slider], Response::HTTP_CREATED);
        } catch (Exception $e) {
            \Log::error('Error creating values home slider: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create values home slider', 'details' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Display the specified values home slider.
     */
    public function show($values_home_id)
    {
        \Log::info('Fetching values home slider with ID: ' . $values_home_id);
        try {
            $slider = ValuesHome::findOrFail($values_home_id);
            \Log::info('Values home slider found: ', $slider->toArray());
            return response()->json($slider, Response::HTTP_OK);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            \Log::warning('Values home slider not found for ID: ' . $values_home_id);
            return response()->json(['error' => 'Values home slider not found'], Response::HTTP_NOT_FOUND);
        } catch (Exception $e) {
            \Log::error('Error fetching values home slider for ID ' . $values_home_id . ': ' . $e->getMessage());
            return response()->json(['error' => 'Failed to retrieve values home slider', 'details' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Update the specified values home slider.
     */
    public function update(Request $request, $values_home_id)
    {
        \Log::info('Values home slider update request data for ID ' . $values_home_id . ': ', $request->all());

        $slider = ValuesHome::find($values_home_id);
        if (!$slider) {
            \Log::warning('Values home slider not found for update, ID: ' . $values_home_id);
            return response()->json(['error' => 'Values home slider not found'], Response::HTTP_NOT_FOUND);
        }

        $validator = Validator::make($request->all(), [
            'description' => 'nullable|string',
            'heading' => 'nullable|string|max:255',
            'home_img' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($validator->fails()) {
            \Log::warning('Validation failed for values home slider update ID ' . $values_home_id . ': ', $validator->errors()->toArray());
            return response()->json(['errors' => $validator->errors()], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        try {
            $validatedData = $validator->validated();

            if ($request->hasFile('home_img')) {
                $image = $request->file('home_img');
                if ($image->getError() !== UPLOAD_ERR_OK) {
                    \Log::warning('File upload error for values home slider ID ' . $values_home_id . ': ' . $image->getErrorMessage());
                    return response()->json(['error' => 'File upload failed'], Response::HTTP_BAD_REQUEST);
                }

                if ($slider->home_img) {
                    $oldImagePath = public_path($slider->home_img);
                    if (File::exists($oldImagePath)) {
                        File::delete($oldImagePath);
                        \Log::info('Deleted old values home slider image: ' . $oldImagePath);
                    } else {
                        \Log::warning('Old values home slider image not found for deletion: ' . $oldImagePath);
                    }
                }

                $originalName = pathinfo($image->getClientOriginalName(), PATHINFO_FILENAME);
                $sanitizedName = preg_replace('/[^A-Za-z0-9_.-]+/', '_', $originalName);
                $imageName = time() . '_' . $sanitizedName . '.' . $image->getClientOriginalExtension();

                $destinationFolder = 'Uploads/values_homes';
                $publicDestinationPath = public_path($destinationFolder);

                if (!File::isDirectory($publicDestinationPath)) {
                    File::makeDirectory($publicDestinationPath, 0755, true);
                }

                $image->move($publicDestinationPath, $imageName);
                $validatedData['home_img'] = $destinationFolder . '/' . $imageName;
                \Log::info('New values home slider image uploaded: ' . $validatedData['home_img']);
            } elseif (array_key_exists('home_img', $validatedData) && $validatedData['home_img'] === null) {
                if ($slider->home_img) {
                    $oldImagePath = public_path($slider->home_img);
                    if (File::exists($oldImagePath)) {
                        File::delete($oldImagePath);
                        \Log::info('Deleted existing values home slider image (null input): ' . $oldImagePath);
                    } else {
                        \Log::warning('Existing values home slider image not found for deletion (null input): ' . $oldImagePath);
                    }
                    $validatedData['home_img'] = null;
                }
                \Log::info('Values home slider image field set to null');
            } else {
                \Log::info('No new image uploaded or null specified, preserving existing image: ' . ($slider->home_img ?: 'none'));
            }

            $slider->fill($validatedData)->save();
            \Log::info('Values home slider updated successfully for ID: ' . $values_home_id);

            return response()->json([
                'message' => 'Values home slider updated successfully',
                'slider' => $slider->fresh()
            ], Response::HTTP_OK);
        } catch (Exception $e) {
            \Log::error('Error updating values home slider for ID ' . $values_home_id . ': ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update values home slider', 'details' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Remove the specified values home slider.
     */
    public function destroy($values_home_id)
    {
        $slider = ValuesHome::find($values_home_id);
        if (!$slider) {
            \Log::warning('Values home slider not found for deletion, ID: ' . $values_home_id);
            return response()->json(['error' => 'Values home slider not found'], Response::HTTP_NOT_FOUND);
        }

        try {
            if ($slider->home_img) {
                $imagePath = public_path($slider->home_img);
                if (File::exists($imagePath)) {
                    File::delete($imagePath);
                    \Log::info('Deleted values home slider image: ' . $imagePath);
                } else {
                    \Log::warning('Values home slider image not found for deletion: ' . $imagePath);
                }
            }

            $slider->delete();
            \Log::info('Values home slider deleted successfully for ID: ' . $values_home_id);
            return response()->json(['message' => 'Values home slider deleted successfully'], Response::HTTP_NO_CONTENT);
        } catch (Exception $e) {
            \Log::error('Error deleting values home slider for ID ' . $values_home_id . ': ' . $e->getMessage());
            return response()->json(['error' => 'Failed to delete values home slider', 'details' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}