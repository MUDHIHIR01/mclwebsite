<?php

namespace App\Http\Controllers;

use App\Models\AboutMwananchi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Exception;

class AboutMwananchiController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum')->except(['index', 'show', 'latestRecord', 'allRecords']);
    }

    public function index()
    {
        try {
            Log::info('Attempting to connect to database');
            DB::connection()->getPdo();
            Log::info('Database connection successful');

            Log::info('Checking if about_mwananchi table exists');
            if (!Schema::hasTable('about_mwananchi')) {
                Log::error('Table about_mwananchi does not exist in the database.');
                return response()->json(['error' => 'Database table not found.'], 500);
            }
            Log::info('Table about_mwananchi exists');

            Log::info('Fetching about_mwananchi records');
            $records = AboutMwananchi::select('id', 'category', 'description', 'video_link', 'created_at', 'updated_at')
                ->orderBy('id', 'desc')
                ->get();
            Log::info('Successfully fetched about_mwananchi records.', ['count' => $records->count()]);

            return response()->json(['records' => $records], 200);
        } catch (Exception $e) {
            Log::error('Error fetching about_mwananchi records: ' . $e->getMessage(), [
                'exception' => get_class($e),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['error' => 'Failed to fetch records.', 'details' => $e->getMessage()], 500);
        }
    }

    // Other methods remain unchanged
    public function allRecords()
    {
        try {
            DB::connection()->getPdo();
            
            if (!Schema::hasTable('about_mwananchi')) {
                Log::error('Table about_mwananchi does not exist in the database.');
                return response()->json(['error' => 'Database table not found.'], 500);
            }

            $records = AboutMwananchi::select('id', 'category', 'description', 'video_link', 'created_at', 'updated_at')
                ->orderBy('id', 'asc')
                ->get();

            Log::info('Successfully fetched all about_mwananchi records.', ['count' => $records->count()]);

            return response()->json(['records' => $records], 200);
        } catch (Exception $e) {
            Log::error('Error fetching all about_mwananchi records: ' . $e->getMessage(), [
                'exception' => get_class($e),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['error' => 'Failed to fetch records.', 'details' => $e->getMessage()], 500);
        }
    }

    public function countRecords()
    {
        try {
            DB::connection()->getPdo();
            
            if (!Schema::hasTable('about_mwananchi')) {
                Log::error('Table about_mwananchi does not exist in the database.');
                return response()->json(['error' => 'Database table not found.'], 500);
            }

            $count = AboutMwananchi::count();
            Log::info('Successfully counted about_mwananchi records.', ['count' => $count]);

            return response()->json(['count_records' => $count], 200);
        } catch (Exception $e) {
            Log::error('Error counting about_mwananchi records: ' . $e->getMessage(), [
                'exception' => get_class($e),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['error' => 'Failed to count records.', 'details' => $e->getMessage()], 500);
        }
    }

    public function latestRecord()
    {
        try {
            DB::connection()->getPdo();

            if (!Schema::hasTable('about_mwananchi')) {
                Log::error('Table about_mwananchi does not exist in the database.');
                return response()->json(['error' => 'Database table not found.'], 500);
            }

            $latestRecord = AboutMwananchi::select('id', 'category', 'description', 'video_link', 'created_at', 'updated_at')
                ->orderBy('created_at', 'desc')
                ->first();

            if (!$latestRecord) {
                Log::warning('No about_mwananchi record found for latest request.');
                return response()->json(['message' => 'No record found'], 404);
            }

            Log::info('Successfully fetched latest about_mwananchi record.', ['id' => $latestRecord->id]);

            return response()->json(['record' => $latestRecord], 200);
        } catch (Exception $e) {
            Log::error('Error fetching latest about_mwananchi record: ' . $e->getMessage(), [
                'exception' => get_class($e),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['error' => 'Failed to fetch latest record.', 'details' => $e->getMessage()], 500);
        }
    }

    public function store(Request $request)
    {
        Log::info('AboutMwananchi store request data: ', $request->all());

        $validator = Validator::make($request->all(), [
            'category' => 'required|string|max:255',
            'description' => 'nullable|string',
            'video_link' => 'nullable|url|regex:/^https:\/\/www\.youtube\.com\/embed\/[a-zA-Z0-9_-]+(\?si=[a-zA-Z0-9_-]+)?$/',
        ]);

        if ($validator->fails()) {
            Log::warning('Validation failed for about_mwananchi store: ', $validator->errors()->toArray());
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $data = $validator->validated();

            $record = AboutMwananchi::create($data);
            Log::info('AboutMwananchi record created successfully.', ['id' => $record->id]);

            return response()->json(['message' => 'Record created successfully', 'record' => $record], 201);
        } catch (Exception $e) {
            Log::error('Error creating about_mwananchi record: ' . $e->getMessage(), [
                'exception' => get_class($e),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['error' => 'Failed to create record.', 'details' => $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        try {
            if (!Schema::hasTable('about_mwananchi')) {
                Log::error('Table about_mwananchi does not exist in the database.');
                return response()->json(['error' => 'Database table not found.'], 500);
            }

            $record = AboutMwananchi::select('id', 'category', 'description', 'video_link', 'created_at', 'updated_at')
                ->find($id);

            if (!$record) {
                Log::warning('AboutMwananchi record not found for ID: ' . $id);
                return response()->json(['message' => 'Record not found'], 404);
            }

            Log::info('Successfully fetched about_mwananchi record.', ['id' => $id]);

            return response()->json(['record' => $record], 200);
        } catch (Exception $e) {
            Log::error('Error fetching about_mwananchi record: ' . $e->getMessage(), [
                'exception' => get_class($e),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['error' => 'Failed to fetch record.', 'details' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        Log::info('AboutMwananchi update request data for ID ' . $id . ': ', $request->all());

        try {
            $record = AboutMwananchi::find($id);
            if (!$record) {
                Log::warning('AboutMwananchi record not found for ID: ' . $id);
                return response()->json(['message' => 'Record not found'], 404);
            }

            $validator = Validator::make($request->all(), [
                'category' => 'required|string|max:255',
                'description' => 'nullable|string',
                'video_link' => 'nullable|url|regex:/^https:\/\/www\.youtube\.com\/embed\/[a-zA-Z0-9_-]+(\?si=[a-zA-Z0-9_-]+)?$/',
            ]);

            if ($validator->fails()) {
                Log::warning('Validation failed for about_mwananchi update ID ' . $id . ': ', $validator->errors()->toArray());
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $data = $validator->validated();

            $record->fill($data)->save();
            Log::info('AboutMwananchi record updated successfully for ID: ' . $id);

            return response()->json([
                'message' => 'Record updated successfully.',
                'record' => $record->fresh()
            ], 200);
        } catch (Exception $e) {
            Log::error('Error updating about_mwananchi record for ID ' . $id . ': ' . $e->getMessage(), [
                'exception' => get_class($e),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['error' => 'Failed to update record.', 'details' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $record = AboutMwananchi::find($id);
            if (!$record) {
                Log::warning('AboutMwananchi record not found for ID: ' . $id);
                return response()->json(['message' => 'Record not found'], 404);
            }

            $record->delete();
            Log::info('AboutMwananchi record deleted successfully for ID: ' . $id);

            return response()->json(['message' => 'Record deleted successfully'], 200);
        } catch (Exception $e) {
            Log::error('Error deleting about_mwananchi record: ' . $e->getMessage(), [
                'exception' => get_class($e),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['error' => 'Failed to delete record.', 'details' => $e->getMessage()], 500);
        }
    }
}
