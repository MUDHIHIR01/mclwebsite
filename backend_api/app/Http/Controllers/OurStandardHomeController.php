<?php

namespace App\Http\Controllers;

use App\Models\OurStandardHome;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Exception;

class OurStandardHomeController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum')->except(['index', 'show', 'latest','ourStandardHomeSlider']);
    }

    /**
     * Return a standardized JSON response.
     *
     * @param mixed $data
     * @param string $message
     * @param int $status
     * @return \Illuminate\Http\JsonResponse
     */
    private function jsonResponse($data, string $message, int $status)
    {
        return response()->json([
            'message' => $message,
            'data' => $data,
        ], $status);
    }

    /**
     * Handle image upload and deletion.
     *
     * @param Request $request
     * @param OurStandardHome|null $ourStandard
     * @return string|null
     */
    private function handleImageUpload(Request $request, ?OurStandardHome $ourStandard = null): ?string
    {
        if (!$request->hasFile('home_img') || !$request->file('home_img')->isValid()) {
            return $ourStandard?->home_img;
        }

        // Delete old image if it exists
        if ($ourStandard && $ourStandard->home_img && file_exists(public_path($ourStandard->home_img))) {
            unlink(public_path($ourStandard->home_img));
            Log::info('Deleted image file', ['path' => $ourStandard->home_img]);
        }

        $image = $request->file('home_img');
        $imageName = time() . '_' . preg_replace('/\s+/', '_', $image->getClientOriginalName());
        $uploadPath = public_path('Uploads/our_standard_home_images');

        if (!file_exists($uploadPath)) {
            mkdir($uploadPath, 0755, true);
        }

        $image->move($uploadPath, $imageName);
        $imagePath = 'Uploads/our_standard_home_images/' . $imageName;
        Log::info('Uploaded image file', ['path' => $imagePath]);

        return $imagePath;
    }

    /**
     * Display a listing of our_standard_home records.
     */
    public function index()
    {
        try {
            $ourStandards = OurStandardHome::orderBy('id', 'desc')->get();
            return $this->jsonResponse(['our_standard_homes' => $ourStandards], 'OurStandardHome records retrieved successfully', 200);
        } catch (Exception $e) {
            Log::error('Error fetching OurStandardHome records', ['error' => $e->getMessage()]);
            return $this->jsonResponse(null, 'Failed to fetch OurStandardHome records', 500);
        }
    }

    public function ourStandardHomeSlider()
    {
        try {
            $ourStandards = OurStandardHome::orderBy('id', 'desc')->get();
            return $this->jsonResponse(['our_standard_homes' => $ourStandards], 'OurStandardHome records retrieved successfully', 200);
        } catch (Exception $e) {
            Log::error('Error fetching OurStandardHome records', ['error' => $e->getMessage()]);
            return $this->jsonResponse(null, 'Failed to fetch OurStandardHome records', 500);
        }
    }

    /**
     * Display the latest our_standard_home record based on created_at.
     */
    public function latest()
    {
        try {
            $latestOurStandard = OurStandardHome::orderBy('created_at', 'desc')->first();

            if (!$latestOurStandard) {
                return $this->jsonResponse(null, 'No OurStandardHome record found', 404);
            }

            return $this->jsonResponse(['our_standard_home' => $latestOurStandard], 'Latest OurStandardHome record retrieved successfully', 200);
        } catch (Exception $e) {
            Log::error('Error fetching latest OurStandardHome record', ['error' => $e->getMessage()]);
            return $this->jsonResponse(null, 'Failed to fetch latest OurStandardHome record', 500);
        }
    }

    /**
     * Store a newly created our_standard_home record.
     */
    public function store(Request $request)
    {
        Log::info('Processing store request for OurStandardHome', ['data' => $request->all()]);

        $validator = Validator::make($request->all(), [
            'heading' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'home_img' => 'nullable|file|mimes:jpeg,png,jpg,gif|max:2048',
        ], [
            'heading.required' => 'The heading field is required.',
            'home_img.mimes' => 'The image must be a JPEG, PNG, JPG, or GIF file.',
            'home_img.max' => 'The image size must not exceed 2MB.',
        ]);

        if ($validator->fails()) {
            Log::warning('Validation failed for OurStandardHome store', ['errors' => $validator->errors()->toArray()]);
            return $this->jsonResponse(['errors' => $validator->errors()], 'Validation failed', 422);
        }

        try {
            $data = $validator->validated();
            $data['home_img'] = $this->handleImageUpload($request);

            $ourStandard = OurStandardHome::create($data);
            return $this->jsonResponse(['our_standard_home' => $ourStandard], 'OurStandardHome record created successfully', 201);
        } catch (Exception $e) {
            Log::error('Error creating OurStandardHome record', ['error' => $e->getMessage()]);
            return $this->jsonResponse(null, 'Failed to create OurStandardHome record', 500);
        }
    }

    /**
     * Display the specified our_standard_home record.
     */
    public function show($id)
    {
        $ourStandard = OurStandardHome::find($id);

        if (!$ourStandard) {
            return $this->jsonResponse(null, 'OurStandardHome record not found', 404);
        }

        return $this->jsonResponse(['our_standard_home' => $ourStandard], 'OurStandardHome record retrieved successfully', 200);
    }

    /**
     * Update the specified our_standard_home record.
     */
    public function update(Request $request, $id)
    {
        Log::info('Processing update request for OurStandardHome', ['id' => $id, 'data' => $request->all()]);

        $ourStandard = OurStandardHome::find($id);
        if (!$ourStandard) {
            return $this->jsonResponse(null, 'OurStandardHome record not found', 404);
        }

        $validator = Validator::make($request->all(), [
            'heading' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'home_img' => 'nullable|file|mimes:jpeg,png,jpg,gif|max:2048',
        ], [
            'heading.required' => 'The heading field is required.',
            'home_img.mimes' => 'The image must be a JPEG, PNG, JPG, or GIF file.',
            'home_img.max' => 'The image size must not exceed 2MB.',
        ]);

        if ($validator->fails()) {
            Log::warning('Validation failed for OurStandardHome update', ['id' => $id, 'errors' => $validator->errors()->toArray()]);
            return $this->jsonResponse(['errors' => $validator->errors()], 'Validation failed', 422);
        }

        try {
            $data = $validator->validated();
            $data['home_img'] = $this->handleImageUpload($request, $ourStandard);

            $ourStandard->update($data);
            return $this->jsonResponse(['our_standard_home' => $ourStandard->fresh()], 'OurStandardHome record updated successfully', 200);
        } catch (Exception $e) {
            Log::error('Error updating OurStandardHome record', ['id' => $id, 'error' => $e->getMessage()]);
            return $this->jsonResponse(null, 'Failed to update OurStandardHome record', 500);
        }
    }

    /**
     * Remove the specified our_standard_home record.
     */
    public function destroy($id)
    {
        $ourStandard = OurStandardHome::find($id);
        if (!$ourStandard) {
            return $this->jsonResponse(null, 'OurStandardHome record not found', 404);
        }

        try {
            if ($ourStandard->home_img && file_exists(public_path($ourStandard->home_img))) {
                unlink(public_path($ourStandard->home_img));
                Log::info('Deleted image file', ['path' => $ourStandard->home_img]);
            }

            $ourStandard->delete();
            return $this->jsonResponse(null, 'OurStandardHome record deleted successfully', 200);
        } catch (Exception $e) {
            Log::error('Error deleting OurStandardHome record', ['id' => $id, 'error' => $e->getMessage()]);
            return $this->jsonResponse(null, 'Failed to delete OurStandardHome record', 500);
        }
    }
}