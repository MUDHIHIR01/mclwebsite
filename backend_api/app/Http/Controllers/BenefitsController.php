<?php

namespace App\Http\Controllers;

use App\Models\Benefit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Exception;

class BenefitsController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum')->except(['index', 'show', 'allBenefits']);
    }

    /**
     * Display a listing of benefit records.
     */
    public function index()
    {
        try {
            $benefits = Benefit::orderBy('benefit_id', 'desc')->get();
            return response()->json(['benefits' => $benefits], 200);
        } catch (Exception $e) {
            \Log::error('Error fetching benefit records: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch benefit records.'], 500);
        }
    }

    /**
     * Display all benefit records (alternative endpoint).
     */
    public function allBenefits()
    {
        try {
            $benefits = Benefit::orderBy('benefit_id', 'desc')->get();
            return response()->json(['benefits' => $benefits], 200);
        } catch (Exception $e) {
            \Log::error('Error fetching all benefit records: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch benefit records.'], 500);
        }
    }

    /**
     * Store a newly created benefit record.
     */
    public function store(Request $request)
    {
        \Log::info('Benefit store request data: ', $request->all());

        $validator = Validator::make($request->all(), [
            'category' => 'required|string|max:255',
            'img_file' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            \Log::warning('Validation failed for Benefit store: ', $validator->errors()->toArray());
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $data = $validator->validated();

            // Handle image upload
            if ($request->hasFile('img_file') && $request->file('img_file')->isValid()) {
                $image = $request->file('img_file');
                $imageName = time() . '_' . preg_replace('/\s+/', '_', $image->getClientOriginalName());
                $uploadPath = public_path('uploads/benefits');

                if (!file_exists($uploadPath)) {
                    mkdir($uploadPath, 0755, true);
                }

                $image->move($uploadPath, $imageName);
                $data['img_file'] = 'uploads/benefits/' . $imageName;
                \Log::info('Benefit image uploaded: ' . $data['img_file']);
            }

            $benefit = Benefit::create($data);
            return response()->json(['message' => 'Benefit record created successfully', 'benefit' => $benefit], 201);
        } catch (Exception $e) {
            \Log::error('Error creating benefit record: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create benefit record.', 'details' => $e->getMessage()], 500);
        }
    }

    /**
     * Display the specified benefit record.
     */
    public function show($benefit_id)
    {
        $benefit = Benefit::find($benefit_id);

        if (!$benefit) {
            return response()->json(['message' => 'Benefit record not found'], 404);
        }

        return response()->json(['benefit' => $benefit], 200);
    }

    /**
     * Update the specified benefit record using POST.
     */
    public function update(Request $request, $benefit_id)
    {
        \Log::info('Benefit update request data: ', $request->all());

        $benefit = Benefit::find($benefit_id);
        if (!$benefit) {
            return response()->json(['message' => 'Benefit record not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'category' => 'required|string|max:255',
            'img_file' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            \Log::warning('Validation failed for Benefit update: ', $validator->errors()->toArray());
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $data = $validator->validated();

            // Handle image upload
            if ($request->hasFile('img_file') && $request->file('img_file')->isValid()) {
                if ($benefit->img_file && file_exists(public_path($benefit->img_file))) {
                    unlink(public_path($benefit->img_file));
                    \Log::info('Deleted old benefit image: ' . $benefit->img_file);
                }

                $image = $request->file('img_file');
                $imageName = time() . '_' . preg_replace('/\s+/', '_', $image->getClientOriginalName());
                $uploadPath = public_path('uploads/benefits');

                if (!file_exists($uploadPath)) {
                    mkdir($uploadPath, 0755, true);
                }

                $image->move($uploadPath, $imageName);
                $data['img_file'] = 'uploads/benefits/' . $imageName;
                \Log::info('New benefit image uploaded: ' . $data['img_file']);
            } else {
                $data['img_file'] = $benefit->img_file;
                \Log::info('No new benefit image uploaded, preserving existing: ' . ($benefit->img_file ?: 'none'));
            }

            $benefit->fill($data)->save();
            return response()->json(['message' => 'Benefit record updated successfully.', 'benefit' => $benefit->fresh()], 200);
        } catch (Exception $e) {
            \Log::error('Error updating benefit record: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update benefit record.', 'details' => $e->getMessage()], 500);
        }
    }

    /**
     * Remove the specified benefit record.
     */
    public function destroy($benefit_id)
    {
        $benefit = Benefit::find($benefit_id);
        if (!$benefit) {
            return response()->json(['message' => 'Benefit record not found'], 404);
        }

        try {
            if ($benefit->img_file && file_exists(public_path($benefit->img_file))) {
                unlink(public_path($benefit->img_file));
                \Log::info('Deleted benefit image: ' . $benefit->img_file);
            }

            $benefit->delete();
            return response()->json(['message' => 'Benefit record deleted successfully'], 200);
        } catch (Exception $e) {
            \Log::error('Error deleting benefit record: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to delete benefit record.', 'details' => $e->getMessage()], 500);
        }
    }
}
