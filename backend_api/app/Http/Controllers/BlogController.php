<?php

namespace App\Http\Controllers;

use App\Models\Blog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Exception;

class BlogController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum')->except(['index', 'show', 'latestBlog', 'allBlogs']);
    }

    /**
     * Display a listing of blog records.
     */
    public function index()
    {
        try {
            $blogs = Blog::orderBy('blog_id', 'desc')->get();
            return response()->json(['blogs' => $blogs], 200);
        } catch (Exception $e) {
            \Log::error('Error fetching blog records: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch blog records.'], 500);
        }
    }

    /**
     * Display all blog records.
     */
    public function allBlogs()
    {
        try {
            $blogs = Blog::orderBy('blog_id', 'desc')->get();
            return response()->json(['blogs' => $blogs], 200);
        } catch (Exception $e) {
            \Log::error('Error fetching blog records: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch blog records.'], 500);
        }
    }

    /**
     * Display the latest blog record based on created_at.
     */
    public function latestBlog()
    {
        try {
            $latestBlog = Blog::orderBy('created_at', 'desc')->first();
            
            if (!$latestBlog) {
                return response()->json(['message' => 'No blog record found'], 404);
            }

            return response()->json(['blog' => $latestBlog], 200);
        } catch (Exception $e) {
            \Log::error('Error fetching latest blog record: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch latest blog record.'], 500);
        }
    }

    
   public function blogsDropDown()
{
    try {
        // The query is perfect, no changes needed here.
        $blogs = Blog::select('blog_id', 'heading')->orderBy('blog_id', 'desc')->get();
        
        // The key change is here: return the data as a JSON response.
        return response()->json($blogs);

    } catch (Exception $e) {
        \Log::error('Error fetching blog records for dropdown: ' . $e->getMessage());
        // Also return an error in JSON format with an appropriate HTTP status code.
        return response()->json(['error' => 'Failed to fetch blog records.'], 500);
    }
}

    /**
     * Store a newly created blog record.
     */
    public function store(Request $request)
    {
        \Log::info('Blog store request data: ', $request->all());

        $validator = Validator::make($request->all(), [
            'heading' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            \Log::warning('Validation failed for Blog store: ', $validator->errors()->toArray());
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $data = $validator->validated();
            $blog = Blog::create($data);
            return response()->json(['message' => 'Blog record created successfully', 'blog' => $blog], 201);
        } catch (Exception $e) {
            \Log::error('Error creating blog record: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create blog record.', 'details' => $e->getMessage()], 500);
        }
    }

    /**
     * Display the specified blog record.
     */
    public function show($blog_id)
    {
        $blog = Blog::find($blog_id);

        if (!$blog) {
            return response()->json(['message' => 'Blog record not found'], 404);
        }

        return response()->json(['blog' => $blog], 200);
    }

    /**
     * Update the specified blog record.
     */
    public function update(Request $request, $blog_id)
    {
        \Log::info('Blog update request data: ', $request->all());

        $blog = Blog::find($blog_id);
        if (!$blog) {
            return response()->json(['message' => 'Blog record not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'heading' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            \Log::warning('Validation failed for Blog update: ', $validator->errors()->toArray());
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $data = $validator->validated();
            $blog->fill($data)->save();
            return response()->json(['message' => 'Blog record updated successfully.', 'blog' => $blog->fresh()], 200);
        } catch (Exception $e) {
            \Log::error('Error updating blog record: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update blog record.', 'details' => $e->getMessage()], 500);
        }
    }

    /**
     * Remove the specified blog record.
     */
    public function destroy($blog_id)
    {
        $blog = Blog::find($blog_id);
        if (!$blog) {
            return response()->json(['message' => 'Blog record not found'], 404);
        }

        try {
            $blog->delete();
            return response()->json(['message' => 'Blog record deleted successfully'], 200);
        } catch (Exception $e) {
            \Log::error('Error deleting blog record: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to delete blog record.', 'details' => $e->getMessage()], 500);
        }
    }
}