<?php

namespace App\Http\Controllers;

use App\Models\Service;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class ServiceController extends Controller
{
    /**
     * Set up authentication middleware for the controller.
     */
    public function __construct()
    {
        // Require authentication for all methods except for the public-facing ones.
        $this->middleware('auth:sanctum')->except(['index', 'show', 'latestservice','allService']);
    }

    /**
     * Display a listing of all services.
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        try {
            // Renamed allService to index for standard RESTful practice.
            $services = Service::orderBy('service_id', 'desc')->get();
            return response()->json(['services' => $services]);
        } catch (Exception $e) {
            Log::error('Error fetching service records: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch service records.'], 500);
        }
    }


     public function allService(): JsonResponse
    {
        try {
            // Renamed allService to index for standard RESTful practice.
            $services = Service::orderBy('service_id', 'desc')->get();
            return response()->json(['services' => $services]);
        } catch (Exception $e) {
            Log::error('Error fetching service records: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch service records.'], 500);
        }
    }

    /**
     * Display the latest created service.
     *
     * @return JsonResponse
     */
    public function latestservice(): JsonResponse
    {
        try {
            $latestService = Service::latest('created_at')->first(); // A more expressive way to get the latest.
            if (!$latestService) {
                return response()->json(['message' => 'No service record found'], 404);
            }
            return response()->json(['service' => $latestService]);
        } catch (Exception $e) {
            Log::error('Error fetching latest service record: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch latest service record.'], 500);
        }
    }

    /**
     * Store a newly created service in storage.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'service_category' => 'required|string|max:255',
            'service_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'url_link' => 'nullable|url|max:255',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $data = $validator->validated();

            if ($request->hasFile('service_image')) {
                // Use the helper method to handle the upload and get the path
                $data['service_image'] = $this->handleImageUpload($request->file('service_image'));
            }

            $service = Service::create($data);
            return response()->json(['message' => 'Service record created successfully', 'service' => $service], 201);
        } catch (Exception $e) {
            Log::error('Error creating service record: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create service record.', 'details' => $e->getMessage()], 500);
        }
    }

    /**
     * Display the specified service.
     *
     * @param int $service_id
     * @return JsonResponse
     */
    public function show($service_id): JsonResponse
    {
        $service = Service::find($service_id);
        if (!$service) {
            return response()->json(['message' => 'Service record not found'], 404);
        }
        return response()->json(['service' => $service]);
    }

    /**
     * Update the specified service in storage.
     *
     * @param Request $request
     * @param int $service_id
     * @return JsonResponse
     */
    public function update(Request $request, $service_id): JsonResponse
    {
        $service = Service::find($service_id);
        if (!$service) {
            return response()->json(['message' => 'Service record not found'], 404);
        }

        // Note: 'sometimes' rule is great for updates, only validates if present.
        $validator = Validator::make($request->all(), [
            'service_category' => 'sometimes|required|string|max:255',
            'service_image' => 'sometimes|nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'url_link' => 'sometimes|nullable|url|max:255',
            'description' => 'sometimes|nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $data = $validator->validated();

            if ($request->hasFile('service_image')) {
                // Use the helper method to upload the new image and get its path
                // The old image is deleted within the helper if it exists
                $data['service_image'] = $this->handleImageUpload($request->file('service_image'), $service->service_image);
            }

            $service->update($data); // More idiomatic way to update
            return response()->json(['message' => 'Service record updated successfully.', 'service' => $service->fresh()]);
        } catch (Exception $e) {
            Log::error('Error updating service record: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update service record.', 'details' => $e->getMessage()], 500);
        }
    }

    /**
     * Remove the specified service from storage.
     *
     * @param int $service_id
     * @return JsonResponse
     */
    public function destroy($service_id): JsonResponse
    {
        $service = Service::find($service_id);
        if (!$service) {
            return response()->json(['message' => 'Service record not found'], 404);
        }

        try {
            // Use the helper to delete the associated image before deleting the record
            $this->deleteImage($service->service_image);
            $service->delete();

            return response()->json(['message' => 'Service record deleted successfully']);
        } catch (Exception $e) {
            Log::error('Error deleting service record: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to delete service record.', 'details' => $e->getMessage()], 500);
        }
    }


    /**
     * Handles the file upload process.
     *
     * @param UploadedFile $image The uploaded file instance.
     * @param string|null $oldImagePath The path to the old image to be deleted.
     * @return string The public path to the newly saved image.
     */
    private function handleImageUpload(UploadedFile $image, ?string $oldImagePath = null): string
    {
        // First, delete the old image if it exists.
        if ($oldImagePath) {
            $this->deleteImage($oldImagePath);
        }

        // Generate a unique name for the image.
        $imageName = time() . '_' . preg_replace('/\s+/', '_', $image->getClientOriginalName());

        // Define the upload path within the public directory.
        $uploadPath = 'uploads/service_images';

        // Move the file to the public/uploads/service_images directory.
        $image->move(public_path($uploadPath), $imageName);
        
        Log::info('Service image uploaded: ' . $uploadPath . '/' . $imageName);

        // Return the relative path for storing in the database.
        return $uploadPath . '/' . $imageName;
    }

    /**
     * Deletes an image from the public path if it exists.
     *
     * @param string|null $imagePath The database path to the image.
     */
    private function deleteImage(?string $imagePath): void
    {
        if ($imagePath && File::exists(public_path($imagePath))) {
            File::delete(public_path($imagePath));
            Log::info('Deleted service image: ' . $imagePath);
        }
    }
}