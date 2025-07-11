<?php

namespace App\Http\Controllers;

use App\Models\About;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\File; // For direct public path file operations
// use Illuminate\Support\Facades\Storage; // No longer strictly needed for image operations here
use Exception;

class AboutController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum')->except(['index', 'show','AboutSliders']);
    }

    // Get all about entries
    public function index()
    {
        try {
            \Log::info('Fetching all about entries');
            $about = About::all();
            \Log::info('Retrieved about entries: ', $about->toArray());
            return response()->json($about, Response::HTTP_OK);
        } catch (Exception $e) {
            \Log::error('Error fetching about entries: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to retrieve about entries', 'details' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function AboutSliders()
    {
        try {
            \Log::info('Fetching all about entries');
            $about = About::all();
            \Log::info('Retrieved about entries: ', $about->toArray());
            return response()->json($about, Response::HTTP_OK);
        } catch (Exception $e) {
            \Log::error('Error fetching about entries: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to retrieve about entries', 'details' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }


    

    // Create a new about entry
    public function store(Request $request)
    {
        \Log::info('About store request data: ', $request->all());

        $validator = Validator::make($request->all(), [
            'description' => 'nullable|string',
            'heading' => 'nullable|string|max:255',
            'home_img' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:16048', // Max 2MB
        ]);

        if ($validator->fails()) {
            \Log::warning('Validation failed for About store: ', $validator->errors()->toArray());
            return response()->json(['errors' => $validator->errors()], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        try {
            $validatedData = $validator->validated();

            // Handle home_img upload
            if ($request->hasFile('home_img')) {
                $image = $request->file('home_img');
                
                // Sanitize filename and ensure uniqueness
                $originalName = pathinfo($image->getClientOriginalName(), PATHINFO_FILENAME);
                $sanitizedName = preg_replace('/[^A-Za-z0-9_.-]+/', '_', $originalName);
                $imageName = time() . '_' . $sanitizedName . '.' . $image->getClientOriginalExtension();
                
                $destinationFolder = 'uploads/about_images'; // Relative to public path
                $publicDestinationPath = public_path($destinationFolder);

                // Ensure the directory exists
                if (!File::isDirectory($publicDestinationPath)) {
                    File::makeDirectory($publicDestinationPath, 0755, true, true);
                }
                
                $image->move($publicDestinationPath, $imageName);
                $validatedData['home_img'] = $destinationFolder . '/' . $imageName; // Store path relative to public directory
                \Log::info('About image uploaded to public/uploads: ' . $validatedData['home_img']);
            }

            $about = About::create($validatedData);
            \Log::info('About entry created successfully: ', $about->toArray());
            return response()->json(['message' => 'About entry created successfully', 'about' => $about], Response::HTTP_CREATED);
        } catch (Exception $e) {
            \Log::error('Error creating about entry: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create about entry', 'details' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    // Get a single about entry by about_id
    public function show($about_id)
    {
        \Log::info('Fetching about entry with ID: ' . $about_id);
        try {
            $about = About::findOrFail($about_id);
            \Log::info('About entry found: ', $about->toArray());
            return response()->json($about, Response::HTTP_OK);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            \Log::warning('About entry not found for ID: ' . $about_id);
            return response()->json(['error' => 'About entry not found'], Response::HTTP_NOT_FOUND);
        } catch (Exception $e) {
            \Log::error('Error fetching about entry for ID ' . $about_id . ': ' . $e->getMessage());
            return response()->json(['error' => 'Failed to retrieve about entry', 'details' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    // Update an existing about entry
    public function update(Request $request, $about_id)
    {
        \Log::info('About update request data for ID ' . $about_id . ': ', $request->all());

        $about = About::find($about_id);
        if (!$about) {
            \Log::warning('About entry not found for ID: ' . $about_id);
            return response()->json(['message' => 'About entry not found'], Response::HTTP_NOT_FOUND);
        }

        $validator = Validator::make($request->all(), [
            'description' => 'nullable|string',
            'heading' => 'nullable|string|max:255',
            'home_img' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // Max 2MB
        ]);

        if ($validator->fails()) {
            \Log::warning('Validation failed for About update ID ' . $about_id . ': ', $validator->errors()->toArray());
            return response()->json(['errors' => $validator->errors()], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        try {
            $validatedData = $validator->validated();

            // Handle home_img upload or removal
            if ($request->hasFile('home_img')) {
                // New image uploaded, delete old one if exists
                if ($about->home_img) {
                    $oldImagePath = public_path($about->home_img);
                    if (File::exists($oldImagePath)) {
                        File::delete($oldImagePath);
                        \Log::info('Deleted old about image from public path: ' . $oldImagePath);
                    } else {
                        \Log::warning('Old about image not found at public path for deletion: ' . $oldImagePath . ' (DB path: ' . $about->home_img . ')');
                    }
                }

                $image = $request->file('home_img');
                $originalName = pathinfo($image->getClientOriginalName(), PATHINFO_FILENAME);
                $sanitizedName = preg_replace('/[^A-Za-z0-9_.-]+/', '_', $originalName);
                $imageName = time() . '_' . $sanitizedName . '.' . $image->getClientOriginalExtension();
                
                $destinationFolder = 'uploads/about_images';
                $publicDestinationPath = public_path($destinationFolder);

                if (!File::isDirectory($publicDestinationPath)) {
                    File::makeDirectory($publicDestinationPath, 0755, true, true);
                }

                $image->move($publicDestinationPath, $imageName);
                $validatedData['home_img'] = $destinationFolder . '/' . $imageName;
                \Log::info('New about image uploaded to public/uploads: ' . $validatedData['home_img']);

            } elseif (array_key_exists('home_img', $validatedData) && $validatedData['home_img'] === null) {
                // home_img was explicitly set to null in the request (client wants to remove image)
                if ($about->home_img) {
                    $oldImagePath = public_path($about->home_img);
                    if (File::exists($oldImagePath)) {
                        File::delete($oldImagePath);
                        \Log::info('Deleted existing about image (due to null input) from public path: ' . $oldImagePath);
                    } else {
                         \Log::warning('Old about image not found at public path for removal (due to null input): ' . $oldImagePath . ' (DB path: ' . $about->home_img . ')');
                    }
                    // $validatedData['home_img'] is already null, so DB will be updated to null by fill()
                }
                \Log::info('About image field was set to null. Old image (if any) deleted.');
            } else {
                // No new image uploaded, and home_img was not explicitly set to null.
                // If home_img was not in the request, $validatedData will not have 'home_img' key.
                // $about->fill($validatedData) will preserve the existing $about->home_img in this case.
                \Log::info('No new about image uploaded or explicit null, existing image path preserved if not in request: ' . ($about->home_img ?: 'none'));
            }

            $about->fill($validatedData)->save();
            \Log::info('About entry updated successfully for ID: ' . $about_id);
            return response()->json([
                'message' => 'About entry updated successfully',
                'about' => $about->fresh() // Use fresh() to get the latest state including any model accessors
            ], Response::HTTP_OK);
        } catch (Exception $e) {
            \Log::error('Error updating about entry for ID ' . $about_id . ': ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update about entry', 'details' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    // Delete an about entry
    public function destroy($about_id)
    {
        $about = About::find($about_id);
        if (!$about) {
            \Log::warning('About entry not found for ID: ' . $about_id);
            return response()->json(['error' => 'About entry not found'], Response::HTTP_NOT_FOUND);
        }

        try {
            // Delete image if it exists
            if ($about->home_img) {
                $imagePath = public_path($about->home_img);
                if (File::exists($imagePath)) {
                    File::delete($imagePath);
                    \Log::info('Deleted about image from public path: ' . $imagePath);
                } else {
                    \Log::warning('About image not found at public path for deletion: ' . $imagePath . ' (DB path: ' . $about->home_img . ')');
                }
            }

            $about->delete();
            \Log::info('About entry deleted successfully for ID: ' . $about_id);
            // Original code returned a body with 204, which is unconventional.
            // Sticking to it to minimize unintended changes to client expectations.
            return response()->json(['message' => 'About entry deleted successfully'], Response::HTTP_NO_CONTENT);
        } catch (Exception $e) {
            \Log::error('Error deleting about entry for ID ' . $about_id . ': ' . $e->getMessage());
            return response()->json(['error' => 'Failed to delete about entry', 'details' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    // Count about entries
    public function countAbout()
    {
        try {
            \Log::info('Counting about entries');
            $count = About::count();
            \Log::info('About entries count: ' . $count);
            return response()->json(['about_entries' => $count], Response::HTTP_OK);
        } catch (Exception $e) {
            \Log::error('Error counting about entries: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to count about entries', 'details' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    // Fetch about_id and description as dropdown options
    public function getDropdownOptions()
    {
        try {
            \Log::info('Fetching about dropdown options');
            $about = About::select('about_id', 'description', 'heading')->distinct()->get();
            \Log::info('Retrieved about dropdown options: ', $about->toArray());
            return response()->json($about, Response::HTTP_OK);
        } catch (Exception $e) {
            \Log::error('Error fetching about dropdown options: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch dropdown options', 'details' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}