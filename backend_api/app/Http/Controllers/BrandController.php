<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\File;
use Exception;

class BrandController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum')->except(['index', 'show', 'allBrands']);
    }

    public function index()
    {
        try {
            \Log::info('Fetching all brands');
            $brands = Brand::orderBy('brand_id', 'desc')->get();
            \Log::info('Retrieved brands', ['count' => $brands->count()]);
            return response()->json($brands, Response::HTTP_OK);
        } catch (Exception $e) {
            \Log::error('Error fetching brands: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to fetch brands',
                'details' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function allBrands()
    {
        try {
            \Log::info('Fetching all brands');
            $brands = Brand::orderBy('brand_id', 'desc')->get();
            \Log::info('Retrieved brands', ['count' => $brands->count()]);
            return response()->json($brands, Response::HTTP_OK);
        } catch (Exception $e) {
            \Log::error('Error fetching brands: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to fetch brands',
                'details' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function store(Request $request)
    {
        \Log::info('Brand store request', ['data' => $request->all()]);

        $validator = Validator::make($request->all(), [
            'category' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'brand_img' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($validator->fails()) {
            \Log::warning('Validation failed for brand store', ['errors' => $validator->errors()->toArray()]);
            return response()->json(['errors' => $validator->errors()], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        try {
            $validatedData = $validator->validated();

            if ($request->hasFile('brand_img')) {
                $image = $request->file('brand_img');
                $imageName = $this->handleImageUpload($image, 'Uploads/brands');
                $validatedData['brand_img'] = $imageName;
                \Log::info('Brand image uploaded', ['path' => $imageName]);
            }

            $brand = Brand::create($validatedData);
            \Log::info('Brand created successfully', ['brand' => $brand->toArray()]);
            return response()->json([
                'message' => 'Brand created successfully',
                'brand' => $brand
            ], Response::HTTP_CREATED);
        } catch (Exception $e) {
            \Log::error('Error creating brand: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to create brand',
                'details' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function show($brand_id)
    {
        \Log::info('Fetching brand', ['brand_id' => $brand_id]);
        try {
            $brand = Brand::findOrFail($brand_id);
            \Log::info('Brand found', ['brand' => $brand->toArray()]);
            return response()->json($brand, Response::HTTP_OK);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            \Log::warning('Brand not found', ['brand_id' => $brand_id]);
            return response()->json(['error' => 'Brand not found'], Response::HTTP_NOT_FOUND);
        } catch (Exception $e) {
            \Log::error('Error fetching brand: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to retrieve brand',
                'details' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function update(Request $request, $brand_id)
    {
        \Log::info('Brand update request', ['brand_id' => $brand_id, 'data' => $request->all()]);

        $brand = Brand::find($brand_id);
        if (!$brand) {
            \Log::warning('Brand not found for update', ['brand_id' => $brand_id]);
            return response()->json(['error' => 'Brand not found'], Response::HTTP_NOT_FOUND);
        }

        $validator = Validator::make($request->all(), [
            'category' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'brand_img' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($validator->fails()) {
            \Log::warning('Validation failed for brand update', ['id' => $brand_id, 'errors' => $validator->errors()->toArray()]);
            return response()->json(['errors' => $validator->errors()], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        try {
            $validatedData = $validator->validated();

            if ($request->hasFile('brand_img')) {
                $image = $request->file('brand_img');
                $this->deleteOldImage($brand->brand_img, 'Uploads/brands');
                $imageName = $this->handleImageUpload($image, 'Uploads/brands');
                $validatedData['brand_img'] = $imageName;
                \Log::info('New brand image uploaded', ['path' => $imageName]);
            } else if (array_key_exists('brand_img', $validatedData) && $validatedData['brand_img'] === null) {
                $this->deleteOldImage($brand->brand_img, 'Uploads/brands');
                $validatedData['brand_img'] = null;
                \Log::info('Brand image set to null');
            }

            $brand->fill($validatedData)->save();
            \Log::info('Brand updated successfully', ['brand' => $brand_id]);

            return response()->json([
                'message' => 'Brand updated successfully',
                'brand' => $brand->fresh()
            ], Response::HTTP_OK);
        } catch (Exception $e) {
            \Log::error('Error updating brand', ['brand_id' => $brand_id, 'error' => $e->getMessage()]);
            return response()->json([
                'error' => 'Failed to update brand',
                'details' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function handleImageUpload($image, $folder)
    {
        $originalName = pathinfo($image->getClientOriginalName(), PATHINFO_FILENAME);
        $sanitizedName = preg_replace('/[^A-Za-z0-9_.-]+/', '_', $originalName);
        $imageName = time() . '_' . $sanitizedName . '.' . $image->getClientOriginalExtension();

        $publicDestinationPath = public_path($folder);
        if (!File::isDirectory($publicDestinationPath)) {
            File::makeDirectory($publicDestinationPath, 0755, true);
        }

        $image->move($publicDestinationPath, $imageName);
        return $folder . '/' . $imageName;
    }

    public function deleteOldImage($imagePath, $folder)
    {
        if ($imagePath) {
            $fullPath = public_path($folder . '/' . basename($imagePath));
            if (File::exists($fullPath)) {
                File::delete($fullPath);
                \Log::info('Deleted old brand image', ['path' => $fullPath]);
            } else {
                \Log::warning('Old brand image not found for deletion', ['path' => $fullPath]);
            }
        }
    }

    public function destroy($brand_id)
    {
        $brand = Brand::find($brand_id);
        if (!$brand) {
            \Log::warning('Brand not found for deletion', ['brand_id' => $brand_id]);
            return response()->json(['error' => 'Brand not found'], Response::HTTP_NOT_FOUND);
        }

        try {
            $this->deleteOldImage($brand->brand_img, 'Uploads/brands');
            $brand->delete();
            \Log::info('Brand deleted successfully', ['brand_id' => $brand_id]);
            return response()->json(['message' => 'Brand deleted successfully'], Response::HTTP_NO_CONTENT);
        } catch (Exception $e) {
            \Log::error('Error deleting brand', ['brand_id' => $brand_id, 'error' => $e->getMessage()]);
            return response()->json([
                'error' => 'Failed to delete brand',
                'details' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}