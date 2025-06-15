<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\File;
use Exception;

class CompanyController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum')->except(['index', 'show','homeSliders']);
    }

    /**
     * Display a listing of companies.
     */
    public function index()
    {
        try {
            \Log::info('Fetching all companies');
            $companies = Company::orderBy('company_id', 'desc')->get();
            \Log::info('Retrieved companies: ', ['count' => $companies->count()]);
            return response()->json($companies, Response::HTTP_OK);
        } catch (Exception $e) {
            \Log::error('Error fetching companies: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch companies', 'details' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }


        public function homeSliders()
    {
        try {
            \Log::info('Fetching all companies');
            $companies = Company::orderBy('company_id', 'desc')->get();
            \Log::info('Retrieved companies: ', ['count' => $companies->count()]);
            return response()->json($companies, Response::HTTP_OK);
        } catch (Exception $e) {
            \Log::error('Error fetching companies: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch companies', 'details' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }


    /**
 * Fetch the latest company.
 */
public function latest()
{
    try {
        \Log::info('Fetching the latest company');
        $company = Company::orderBy('company_id', 'desc')->first();
        
        if (!$company) {
            \Log::warning('No company found');
            return response()->json(['error' => 'No company found'], Response::HTTP_NOT_FOUND);
        }
        
        \Log::info('Retrieved latest company: ', $company->toArray());
        return response()->json($company, Response::HTTP_OK);
    } catch (Exception $e) {
        \Log::error('Error fetching latest company: ' . $e->getMessage());
        return response()->json(['error' => 'Failed to fetch latest company', 'details' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
    }
}

    /**
     * Store a newly created company.
     */
    public function store(Request $request)
    {
        \Log::info('Company store request data: ', $request->all());

        $validator = Validator::make($request->all(), [
            'description' => 'nullable|string',
            'heading' => 'nullable|string|max:255',
            'home_img' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($validator->fails()) {
            \Log::warning('Validation failed for company store: ', $validator->errors()->toArray());
            return response()->json(['errors' => $validator->errors()], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        try {
            $validatedData = $validator->validated();

            if ($request->hasFile('home_img')) {
                $image = $request->file('home_img');
                $originalName = pathinfo($image->getClientOriginalName(), PATHINFO_FILENAME);
                $sanitizedName = preg_replace('/[^A-Za-z0-9_.-]+/', '_', $originalName);
                $imageName = time() . '_' . $sanitizedName . '.' . $image->getClientOriginalExtension();

                $destinationFolder = 'uploads/company_images';
                $publicDestinationPath = public_path($destinationFolder);

                if (!File::isDirectory($publicDestinationPath)) {
                    File::makeDirectory($publicDestinationPath, 0755, true);
                }

                $image->move($publicDestinationPath, $imageName);
                $validatedData['home_img'] = $destinationFolder . '/' . $imageName;
                \Log::info('Company image uploaded: ' . $validatedData['home_img']);
            }

            $company = Company::create($validatedData);
            \Log::info('Company created successfully: ', $company->toArray());
            return response()->json(['message' => 'Company created successfully', 'company' => $company], Response::HTTP_CREATED);
        } catch (Exception $e) {
            \Log::error('Error creating company: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create company', 'details' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Display the specified company.
     */
    public function show($company_id)
    {
        \Log::info('Fetching company with ID: ' . $company_id);
        try {
            $company = Company::findOrFail($company_id);
            \Log::info('Company found: ', $company->toArray());
            return response()->json($company, Response::HTTP_OK);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            \Log::warning('Company not found for ID: ' . $company_id);
            return response()->json(['error' => 'Company not found'], Response::HTTP_NOT_FOUND);
        } catch (Exception $e) {
            \Log::error('Error fetching company for ID ' . $company_id . ': ' . $e->getMessage());
            return response()->json(['error' => 'Failed to retrieve company', 'details' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Update the specified company.
     */
    public function update(Request $request, $company_id)
{
    \Log::info('Company update request data for ID ' . $company_id . ': ', $request->all());

    // Find the company
    $company = Company::find($company_id);
    if (!$company) {
        \Log::warning('Company not found for update, ID: ' . $company_id);
        return response()->json(['error' => 'Company not found'], Response::HTTP_NOT_FOUND);
    }

    // Define validation rules
    $validator = Validator::make($request->all(), [
        'description' => 'nullable|string',
        'heading' => 'nullable|string|max:255',
        'home_img' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
    ]);

    // Check for validation failure
    if ($validator->fails()) {
        \Log::warning('Validation failed for company update ID ' . $company_id . ': ', $validator->errors()->toArray());
        return response()->json(['errors' => $validator->errors()], Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    try {
        $validatedData = $validator->validated();

        // Handle file upload for home_img
        if ($request->hasFile('home_img')) {
            // Validate file upload error
            $image = $request->file('home_img');
            if ($image->getError() !== UPLOAD_ERR_OK) {
                \Log::warning('File upload error for company ID ' . $company_id . ': ' . $image->getErrorMessage());
                return response()->json(['error' => 'File upload failed'], Response::HTTP_BAD_REQUEST);
            }

            // Delete old image if exists
            if ($company->home_img) {
                $oldImagePath = public_path($company->home_img);
                if (File::exists($oldImagePath)) {
                    File::delete($oldImagePath);
                    \Log::info('Deleted old company image: ' . $oldImagePath);
                } else {
                    \Log::warning('Old company image not found for deletion: ' . $oldImagePath);
                }
            }

            // Process new image
            $originalName = pathinfo($image->getClientOriginalName(), PATHINFO_FILENAME);
            $sanitizedName = preg_replace('/[^A-Za-z0-9_.-]+/', '_', $originalName);
            $imageName = time() . '_' . $sanitizedName . '.' . $image->getClientOriginalExtension();

            $destinationFolder = 'uploads/company_images';
            $publicDestinationPath = public_path($destinationFolder);

            if (!File::isDirectory($publicDestinationPath)) {
                File::makeDirectory($publicDestinationPath, 0755, true);
            }

            $image->move($publicDestinationPath, $imageName);
            $validatedData['home_img'] = $destinationFolder . '/' . $imageName;
            \Log::info('New company image uploaded: ' . $validatedData['home_img']);
        } elseif (array_key_exists('home_img', $validatedData) && $validatedData['home_img'] === null) {
            // Image explicitly set to null, delete existing image if present
            if ($company->home_img) {
                $oldImagePath = public_path($company->home_img);
                if (File::exists($oldImagePath)) {
                    File::delete($oldImagePath);
                    \Log::info('Deleted existing company image (null input): ' . $oldImagePath);
                } else {
                    \Log::warning('Existing company image not found for deletion (null input): ' . $oldImagePath);
                }
                $validatedData['home_img'] = null;
            }
            \Log::info('Company image field set to null');
        } else {
            \Log::info('No new image uploaded or null specified, preserving existing image: ' . ($company->home_img ?: 'none'));
        }

        // Update company with validated data
        $company->fill($validatedData)->save();
        \Log::info('Company updated successfully for ID: ' . $company_id);

        return response()->json([
            'message' => 'Company updated successfully',
            'company' => $company->fresh()
        ], Response::HTTP_OK);
    } catch (Exception $e) {
        \Log::error('Error updating company for ID ' . $company_id . ': ' . $e->getMessage());
        return response()->json(['error' => 'Failed to update company', 'details' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
    }
}

    /**
     * Remove the specified company.
     */
    public function destroy($company_id)
    {
        $company = Company::find($company_id);
        if (!$company) {
            \Log::warning('Company not found for deletion, ID: ' . $company_id);
            return response()->json(['error' => 'Company not found'], Response::HTTP_NOT_FOUND);
        }

        try {
            if ($company->home_img) {
                $imagePath = public_path($company->home_img);
                if (File::exists($imagePath)) {
                    File::delete($imagePath);
                    \Log::info('Deleted company image: ' . $imagePath);
                } else {
                    \Log::warning('Company image not found for deletion: ' . $imagePath);
                }
            }

            $company->delete();
            \Log::info('Company deleted successfully for ID: ' . $company_id);
            return response()->json(['message' => 'Company deleted successfully'], Response::HTTP_NO_CONTENT);
        } catch (Exception $e) {
            \Log::error('Error deleting company for ID ' . $company_id . ': ' . $e->getMessage());
            return response()->json(['error' => 'Failed to delete company', 'details' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}