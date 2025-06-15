<?php

namespace App\Http\Controllers;

use App\Models\News;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Exception;

class NewsController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum')->except(['index', 'show', 'latestnew','allNews']);
    }

    /**
     * Display a listing of news records.
     */
    public function allNews()
    {
        try {
            // Verify database connection
            DB::connection()->getPdo();
            
            // Check if table exists
            if (!Schema::hasTable('news')) {
                \Log::error('Table news does not exist in the database.');
                return response()->json(['error' => 'Database table not found.'], 500);
            }

            // Fetch records with explicit fields
            $newsRecords = News::select('news_id', 'category', 'description', 'news_img', 'pdf_file', 'created_at', 'updated_at')
                ->orderBy('news_id', 'desc')
                ->get();

            \Log::info('Successfully fetched news records.', ['count' => $newsRecords->count()]);

            return response()->json(['news' => $newsRecords], 200);
        } catch (Exception $e) {
            \Log::error('Error fetching news records: ' . $e->getMessage(), [
                'exception' => get_class($e),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['error' => 'Failed to fetch news records.', 'details' => $e->getMessage()], 500);
        }
    }

     public function index()
    {
        try {
            // Verify database connection
            DB::connection()->getPdo();
            
            // Check if table exists
            if (!Schema::hasTable('news')) {
                \Log::error('Table news does not exist in the database.');
                return response()->json(['error' => 'Database table not found.'], 500);
            }

            // Fetch records with explicit fields
            $newsRecords = News::select('news_id', 'category', 'description', 'news_img', 'pdf_file', 'created_at', 'updated_at')
                ->orderBy('news_id', 'desc')
                ->get();

            \Log::info('Successfully fetched news records.', ['count' => $newsRecords->count()]);

            return response()->json(['news' => $newsRecords], 200);
        } catch (Exception $e) {
            \Log::error('Error fetching news records: ' . $e->getMessage(), [
                'exception' => get_class($e),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['error' => 'Failed to fetch news records.', 'details' => $e->getMessage()], 500);
        }
    }

    /**
     * Display the latest news record based on created_at.
     */
    public function latestnew()
    {
        try {
            // Verify database connection
            DB::connection()->getPdo();

            // Check if table exists
            if (!Schema::hasTable('news')) {
                \Log::error('Table news does not exist in the database.');
                return response()->json(['error' => 'Database table not found.'], 500);
            }

            $latestNews = News::select('news_id', 'category', 'description', 'news_img', 'pdf_file', 'created_at', 'updated_at')
                ->orderBy('created_at', 'desc')
                ->first();

            if (!$latestNews) {
                \Log::warning('No news record found for latest request.');
                return response()->json(['message' => 'No news record found'], 404);
            }

            \Log::info('Successfully fetched latest news record.', ['news_id' => $latestNews->news_id]);

            return response()->json(['news' => $latestNews], 200);
        } catch (Exception $e) {
            \Log::error('Error fetching latest news record: ' . $e->getMessage(), [
                'exception' => get_class($e),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['error' => 'Failed to fetch latest news record.', 'details' => $e->getMessage()], 500);
        }
    }

    /**
     * Store a newly created news record.
     */
    public function store(Request $request)
    {
        \Log::info('News store request data: ', $request->all());

        $validator = Validator::make($request->all(), [
            'category' => 'required|string|max:255',
            'description' => 'nullable|string',
            'news_img' => 'nullable|file|mimes:jpeg,png,jpg,gif|max:2048',
            'pdf_file' => 'nullable|file|mimes:pdf|max:2048',
        ]);

        if ($validator->fails()) {
            \Log::warning('Validation failed for news store: ', $validator->errors()->toArray());
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $data = $validator->validated();

            // Handle news_img upload
            if ($request->hasFile('news_img') && $request->file('news_img')->isValid()) {
                $uploadPath = public_path('uploads/news');
                if (!File::exists($uploadPath)) {
                    File::makeDirectory($uploadPath, 0755, true);
                    \Log::info('Created uploads/news directory at: ' . $uploadPath);
                }

                $file = $request->file('news_img');
                $fileName = time() . '_' . $file->getClientOriginalName();
                $file->move($uploadPath, $fileName);
                $data['news_img'] = 'uploads/news/' . $fileName;
                \Log::info('Image uploaded: ' . $data['news_img']);
            }

            // Handle pdf_file upload
            if ($request->hasFile('pdf_file') && $request->file('pdf_file')->isValid()) {
                $uploadPath = public_path('uploads/news');
                if (!File::exists($uploadPath)) {
                    File::makeDirectory($uploadPath, 0755, true);
                    \Log::info('Created uploads/news directory at: ' . $uploadPath);
                }

                $file = $request->file('pdf_file');
                $fileName = time() . '_' . $file->getClientOriginalName();
                $file->move($uploadPath, $fileName);
                $data['pdf_file'] = 'uploads/news/' . $fileName;
                \Log::info('PDF uploaded: ' . $data['pdf_file']);
            }

            $news = News::create($data);
            \Log::info('News record created successfully.', ['news_id' => $news->news_id]);

            return response()->json(['message' => 'News record created successfully', 'news' => $news], 201);
        } catch (Exception $e) {
            \Log::error('Error creating news record: ' . $e->getMessage(), [
                'exception' => get_class($e),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['error' => 'Failed to create news record.', 'details' => $e->getMessage()], 500);
        }
    }

    /**
     * Display the specified news record.
     */
    public function show($news_id)
    {
        try {
            // Check if table exists
            if (!Schema::hasTable('news')) {
                \Log::error('Table news does not exist in the database.');
                return response()->json(['error' => 'Database table not found.'], 500);
            }

            $news = News::select('news_id', 'category', 'description', 'news_img', 'pdf_file', 'created_at', 'updated_at')
                ->find($news_id);

            if (!$news) {
                \Log::warning('News record not found for ID: ' . $news_id);
                return response()->json(['message' => 'News record not found'], 404);
            }

            \Log::info('Successfully fetched news record.', ['news_id' => $news_id]);

            return response()->json(['news' => $news], 200);
        } catch (Exception $e) {
            \Log::error('Error fetching news record: ' . $e->getMessage(), [
                'exception' => get_class($e),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['error' => 'Failed to fetch news record.', 'details' => $e->getMessage()], 500);
        }
    }

    /**
     * Update the specified news record using POST.
     */
    public function update(Request $request, $news_id)
    {
        \Log::info('News update request data for ID ' . $news_id . ': ', $request->all());

        try {
            $news = News::find($news_id);
            if (!$news) {
                \Log::warning('News record not found for ID: ' . $news_id);
                return response()->json(['message' => 'News record not found'], 404);
            }

            $validator = Validator::make($request->all(), [
                'category' => 'required|string|max:255',
                'description' => 'nullable|string',
                'news_img' => 'nullable|file|mimes:jpeg,png,jpg,gif|max:2048',
                'pdf_file' => 'nullable|file|mimes:pdf|max:2048',
            ]);

            if ($validator->fails()) {
                \Log::warning('Validation failed for news update ID ' . $news_id . ': ', $validator->errors()->toArray());
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $data = $validator->validated();

            // Handle news_img upload
            if ($request->hasFile('news_img') && $request->file('news_img')->isValid()) {
                // Delete old image if it exists
                if ($news->news_img && File::exists(public_path($news->news_img))) {
                    File::delete(public_path($news->news_img));
                    \Log::info('Deleted old image: ' . $news->news_img);
                }

                $uploadPath = public_path('uploads/news');
                if (!File::exists($uploadPath)) {
                    File::makeDirectory($uploadPath, 0755, true);
                    \Log::info('Created uploads/news directory at: ' . $uploadPath);
                }

                $file = $request->file('news_img');
                $fileName = time() . '_' . $file->getClientOriginalName();
                $file->move($uploadPath, $fileName);
                $data['news_img'] = 'uploads/news/' . $fileName;
                \Log::info('New image uploaded: ' . $data['news_img']);
            } else {
                $data['news_img'] = $news->news_img;
                \Log::info('No new image uploaded, preserving existing: ' . ($news->news_img ?: 'none'));
            }

            // Handle pdf_file upload
            if ($request->hasFile('pdf_file') && $request->file('pdf_file')->isValid()) {
                // Delete old PDF if it exists
                if ($news->pdf_file && File::exists(public_path($news->pdf_file))) {
                    File::delete(public_path($news->pdf_file));
                    \Log::info('Deleted old PDF: ' . $news->pdf_file);
                }

                $uploadPath = public_path('uploads/news');
                if (!File::exists($uploadPath)) {
                    File::makeDirectory($uploadPath, 0755, true);
                    \Log::info('Created uploads/news directory at: ' . $uploadPath);
                }

                $file = $request->file('pdf_file');
                $fileName = time() . '_' . $file->getClientOriginalName();
                $file->move($uploadPath, $fileName);
                $data['pdf_file'] = 'uploads/news/' . $fileName;
                \Log::info('New PDF uploaded: ' . $data['pdf_file']);
            } else {
                $data['pdf_file'] = $news->pdf_file;
                \Log::info('No new PDF uploaded, preserving existing: ' . ($news->pdf_file ?: 'none'));
            }

            $news->fill($data)->save();
            \Log::info('News record updated successfully for ID: ' . $news_id);

            return response()->json([
                'message' => 'News record updated successfully.',
                'news' => $news->fresh()
            ], 200);
        } catch (Exception $e) {
            \Log::error('Error updating news record for ID ' . $news_id . ': ' . $e->getMessage(), [
                'exception' => get_class($e),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['error' => 'Failed to update news record.', 'details' => $e->getMessage()], 500);
        }
    }

    /**
     * Remove the specified news record.
     */
    public function destroy($news_id)
    {
        try {
            $news = News::find($news_id);
            if (!$news) {
                \Log::warning('News record not found for ID: ' . $news_id);
                return response()->json(['message' => 'News record not found'], 404);
            }

            // Delete news_img if it exists
            if ($news->news_img && File::exists(public_path($news->news_img))) {
                File::delete(public_path($news->news_img));
                \Log::info('Deleted image: ' . $news->news_img);
            }

            // Delete pdf_file if it exists
            if ($news->pdf_file && File::exists(public_path($news->pdf_file))) {
                File::delete(public_path($news->pdf_file));
                \Log::info('Deleted PDF: ' . $news->pdf_file);
            }

            $news->delete();
            \Log::info('News record deleted successfully for ID: ' . $news_id);

            return response()->json(['message' => 'News record deleted successfully'], 200);
        } catch (Exception $e) {
            \Log::error('Error deleting news record: ' . $e->getMessage(), [
                'exception' => get_class($e),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['error' => 'Failed to delete news record.', 'details' => $e->getMessage()], 500);
        }
    }
}