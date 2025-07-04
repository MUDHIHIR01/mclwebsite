<?php

namespace App\Http\Controllers;

use App\Models\AboutMwananchi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class AboutMwananchiController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum')->except(['index', 'show', 'latestRecord', 'allRecords']);
    }

    public function index()
    {
        if (!Schema::hasTable('about_mwananchi')) {
            Log::error('Table about_mwananchi does not exist.');
            return response()->json(['error' => 'Database table not found.'], 500);
        }

        try {
            $records = AboutMwananchi::select('id', 'category', 'description', 'video_link', 'pdf_file', 'created_at', 'updated_at')
                ->orderBy('id', 'desc')
                ->get();
            return response()->json(['records' => $records], 200);
        } catch (\Exception $e) {
            Log::error('Error fetching records: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch records.'], 500);
        }
    }

    public function allRecords()
    {
        if (!Schema::hasTable('about_mwananchi')) {
            Log::error('Table about_mwananchi does not exist.');
            return response()->json(['error' => 'Database table not found.'], 500);
        }

        try {
            $records = AboutMwananchi::select('id', 'category', 'description', 'video_link', 'pdf_file', 'created_at', 'updated_at')
                ->orderBy('id', 'asc')
                ->get();
            return response()->json(['records' => $records], 200);
        } catch (\Exception $e) {
            Log::error('Error fetching all records: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch records.'], 500);
        }
    }

    public function countRecords()
    {
        if (!Schema::hasTable('about_mwananchi')) {
            Log::error('Table about_mwananchi does not exist.');
            return response()->json(['error' => 'Database table not found.'], 500);
        }

        try {
            $count = AboutMwananchi::count();
            return response()->json(['count_records' => $count], 200);
        } catch (\Exception $e) {
            Log::error('Error counting records: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to count records.'], 500);
        }
    }

    public function latestRecord()
    {
        if (!Schema::hasTable('about_mwananchi')) {
            Log::error('Table about_mwananchi does not exist.');
            return response()->json(['error' => 'Database table not found.'], 500);
        }

        try {
            $latestRecord = AboutMwananchi::select('id', 'category', 'description', 'video_link', 'pdf_file', 'created_at', 'updated_at')
                ->orderBy('created_at', 'desc')
                ->first();

            if (!$latestRecord) {
                return response()->json(['message' => 'No record found'], 404);
            }

            return response()->json(['record' => $latestRecord], 200);
        } catch (\Exception $e) {
            Log::error('Error fetching latest record: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch latest record.'], 500);
        }
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'category' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'video_link' => 'nullable|url|regex:/^https:\/\/www\.youtube\.com\/embed\/[a-zA-Z0-9_-]+(\?si=[a-zA-Z0-9_-]+)?$/',
            'pdf_file' => 'nullable|file|mimes:pdf|max:10240',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $data = $validator->validated();

            if ($request->hasFile('pdf_file')) {
                $file = $request->file('pdf_file');
                $filename = time() . '_' . $file->getClientOriginalName();
                $file->move(public_path('uploads'), $filename);
                $data['pdf_file'] = 'uploads/' . $filename;
            }

            $record = AboutMwananchi::create($data);
            return response()->json(['message' => 'Record created successfully', 'record' => $record], 201);
        } catch (\Exception $e) {
            Log::error('Error creating record: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create record.'], 500);
        }
    }

    public function show($id)
    {
        if (!Schema::hasTable('about_mwananchi')) {
            Log::error('Table about_mwananchi does not exist.');
            return response()->json(['error' => 'Database table not found.'], 500);
        }

        try {
            $record = AboutMwananchi::select('id', 'category', 'description', 'video_link', 'pdf_file', 'created_at', 'updated_at')
                ->findOrFail($id);
            return response()->json(['record' => $record], 200);
        } catch (\Exception $e) {
            Log::error('Error fetching record ID ' . $id . ': ' . $e->getMessage());
            return response()->json(['error' => 'Record not found.'], 404);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $record = AboutMwananchi::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'category' => 'required|string|max:255',
                'description' => 'nullable|string|max:1000',
                'video_link' => 'nullable|url|regex:/^https:\/\/www\.youtube\.com\/embed\/[a-zA-Z0-9_-]+(\?si=[a-zA-Z0-9_-]+)?$/',
                'pdf_file' => 'nullable|file|mimes:pdf|max:10240',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $data = $validator->validated();

            if ($request->hasFile('pdf_file')) {
                if ($record->pdf_file && file_exists(public_path($record->pdf_file))) {
                    unlink(public_path($record->pdf_file));
                }
                $file = $request->file('pdf_file');
                $filename = time() . '_' . $file->getClientOriginalName();
                $file->move(public_path('uploads'), $filename);
                $data['pdf_file'] = 'uploads/' . $filename;
            } else {
                $data['pdf_file'] = $record->pdf_file;
            }

            $record->update($data);
            return response()->json(['message' => 'Record updated successfully', 'record' => $record->fresh()], 200);
        } catch (\Exception $e) {
            Log::error('Error updating record ID ' . $id . ': ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update record.'], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $record = AboutMwananchi::findOrFail($id);

            if ($record->pdf_file && file_exists(public_path($record->pdf_file))) {
                unlink(public_path($record->pdf_file));
            }

            $record->delete();
            return response()->json(['message' => 'Record deleted successfully'], 200);
        } catch (\Exception $e) {
            Log::error('Error deleting record ID ' . $id . ': ' . $e->getMessage());
            return response()->json(['error' => 'Failed to delete record.'], 500);
        }
    }
}