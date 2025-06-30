<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Exception;

class EventController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum')->except(['index', 'show', 'latestEvent', 'allEvents']);
    }

    /**
     * Display a listing of event records in descending order.
     */
    public function index()
    {
        try {
            DB::connection()->getPdo();
            
            if (!Schema::hasTable('events')) {
                Log::error('Table events does not exist in the database.');
                return response()->json(['error' => 'Database table not found.'], 500);
            }

            $eventRecords = Event::select('event_id', 'event_category', 'description', 'img_file', 'video_file', 'created_at', 'updated_at')
                ->orderBy('event_id', 'desc')
                ->get();

            Log::info('Successfully fetched event records.', ['count' => $eventRecords->count()]);

            return response()->json(['events' => $eventRecords], 200);
        } catch (Exception $e) {
            Log::error('Error fetching event records: ' . $e->getMessage(), [
                'exception' => get_class($e),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['error' => 'Failed to fetch event records.', 'details' => $e->getMessage()], 500);
        }
    }

    /**
     * Display all event records in ascending order.
     */
    public function allEvents()
    {
        try {
            DB::connection()->getPdo();
            
            if (!Schema::hasTable('events')) {
                Log::error('Table events does not exist in the database.');
                return response()->json(['error' => 'Database table not found.'], 500);
            }

            $eventRecords = Event::select('event_id', 'event_category', 'description', 'img_file', 'video_file', 'created_at', 'updated_at')
                ->orderBy('event_id', 'asc')
                ->get();

            Log::info('Successfully fetched all event records.', ['count' => $eventRecords->count()]);

            return response()->json(['events' => $eventRecords], 200);
        } catch (Exception $e) {
            Log::error('Error fetching all event records: ' . $e->getMessage(), [
                'exception' => get_class($e),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['error' => 'Failed to fetch event records.', 'details' => $e->getMessage()], 500);
        }
    }

    /**
     * Count the total number of event records.
     */
    public function countEvents()
    {
        try {
            DB::connection()->getPdo();
            
            if (!Schema::hasTable('events')) {
                Log::error('Table events does not exist in the database.');
                return response()->json(['error' => 'Database table not found.'], 500);
            }

            $count = Event::count();
            Log::info('Successfully counted event records.', ['count' => $count]);

            return response()->json(['count_events' => $count], 200);
        } catch (Exception $e) {
            Log::error('Error counting event records: ' . $e->getMessage(), [
                'exception' => get_class($e),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['error' => 'Failed to count event records.', 'details' => $e->getMessage()], 500);
        }
    }

    /**
     * Display the latest event record based on created_at.
     */
    public function latestEvent()
    {
        try {
            DB::connection()->getPdo();

            if (!Schema::hasTable('events')) {
                Log::error('Table events does not exist in the database.');
                return response()->json(['error' => 'Database table not found.'], 500);
            }

            $latestEvent = Event::select('event_id', 'event_category', 'description', 'img_file', 'video_file', 'created_at', 'updated_at')
                ->orderBy('created_at', 'desc')
                ->first();

            if (!$latestEvent) {
                Log::warning('No event record found for latest request.');
                return response()->json(['message' => 'No event record found'], 404);
            }

            Log::info('Successfully fetched latest event record.', ['event_id' => $latestEvent->event_id]);

            return response()->json(['event' => $latestEvent], 200);
        } catch (Exception $e) {
            Log::error('Error fetching latest event record: ' . $e->getMessage(), [
                'exception' => get_class($e),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['error' => 'Failed to fetch latest event record.', 'details' => $e->getMessage()], 500);
        }
    }

    /**
     * Store a newly created event record.
     */
    public function store(Request $request)
    {
        Log::info('Event store request data: ', $request->all());

        $validator = Validator::make($request->all(), [
            'event_category' => 'required|string|max:255',
            'description' => 'nullable|string',
            'img_file' => 'nullable|file|mimes:jpeg,png,jpg,gif|max:2048',
            'video_file' => 'nullable|file|mimes:mp4,avi,mov|max:10240', // 10MB max for video
        ]);

        if ($validator->fails()) {
            Log::warning('Validation failed for event store: ', $validator->errors()->toArray());
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $data = $validator->validated();

            // Handle img_file upload
            if ($request->hasFile('img_file') && $request->file('img_file')->isValid()) {
                $uploadPath = public_path('uploads/events');
                if (!File::exists($uploadPath)) {
                    File::makeDirectory($uploadPath, 0755, true);
                    Log::info('Created uploads/events directory at: ' . $uploadPath);
                }

                $file = $request->file('img_file');
                $fileName = time() . '_' . $file->getClientOriginalName();
                $file->move($uploadPath, $fileName);
                $data['img_file'] = 'uploads/events/' . $fileName;
                Log::info('Image uploaded: ' . $data['img_file']);
            }

            // Handle video_file upload
            if ($request->hasFile('video_file') && $request->file('video_file')->isValid()) {
                $uploadPath = public_path('uploads/events');
                if (!File::exists($uploadPath)) {
                    File::makeDirectory($uploadPath, 0755, true);
                    Log::info('Created uploads/events directory at: ' . $uploadPath);
                }

                $file = $request->file('video_file');
                $fileName = time() . '_' . $file->getClientOriginalName();
                $file->move($uploadPath, $fileName);
                $data['video_file'] = 'uploads/events/' . $fileName;
                Log::info('Video uploaded: ' . $data['video_file']);
            }

            $event = Event::create($data);
            Log::info('Event record created successfully.', ['event_id' => $event->event_id]);

            return response()->json(['message' => 'Event record created successfully', 'event' => $event], 201);
        } catch (Exception $e) {
            Log::error('Error creating event record: ' . $e->getMessage(), [
                'exception' => get_class($e),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['error' => 'Failed to create event record.', 'details' => $e->getMessage()], 500);
        }
    }

    /**
     * Display the specified event record.
     */
    public function show($event_id)
    {
        try {
            if (!Schema::hasTable('events')) {
                Log::error('Table events does not exist in the database.');
                return response()->json(['error' => 'Database table not found.'], 500);
            }

            $event = Event::select('event_id', 'event_category', 'description', 'img_file', 'video_file', 'created_at', 'updated_at')
                ->find($event_id);

            if (!$event) {
                Log::warning('Event record not found for ID: ' . $event_id);
                return response()->json(['message' => 'Event record not found'], 404);
            }

            Log::info('Successfully fetched event record.', ['event_id' => $event_id]);

            return response()->json(['event' => $event], 200);
        } catch (Exception $e) {
            Log::error('Error fetching event record: ' . $e->getMessage(), [
                'exception' => get_class($e),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['error' => 'Failed to fetch event record.', 'details' => $e->getMessage()], 500);
        }
    }

    /**
     * Update the specified event record using POST.
     */
    public function update(Request $request, $event_id)
    {
        Log::info('Event update request data for ID ' . $event_id . ': ', $request->all());

        try {
            $event = Event::find($event_id);
            if (!$event) {
                Log::warning('Event record not found for ID: ' . $event_id);
                return response()->json(['message' => 'Event record not found'], 404);
            }

            $validator = Validator::make($request->all(), [
                'event_category' => 'required|string|max:255',
                'description' => 'nullable|string',
                'img_file' => 'nullable|file|mimes:jpeg,png,jpg,gif|max:2048',
                'video_file' => 'nullable|file|mimes:mp4,avi,mov|max:10240', // 10MB max for video
            ]);

            if ($validator->fails()) {
                Log::warning('Validation failed for event update ID ' . $event_id . ': ', $validator->errors()->toArray());
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $data = $validator->validated();

            // Handle img_file upload
            if ($request->hasFile('img_file') && $request->file('img_file')->isValid()) {
                if ($event->img_file && File::exists(public_path($event->img_file))) {
                    File::delete(public_path($event->img_file));
                    Log::info('Deleted old image: ' . $event->img_file);
                }

                $uploadPath = public_path('uploads/events');
                if (!File::exists($uploadPath)) {
                    File::makeDirectory($uploadPath, 0755, true);
                    Log::info('Created uploads/events directory at: ' . $uploadPath);
                }

                $file = $request->file('img_file');
                $fileName = time() . '_' . $file->getClientOriginalName();
                $file->move($uploadPath, $fileName);
                $data['img_file'] = 'uploads/events/' . $fileName;
                Log::info('New image uploaded: ' . $data['img_file']);
            } else {
                $data['img_file'] = $event->img_file;
                Log::info('No new image uploaded, preserving existing: ' . ($event->img_file ?: 'none'));
            }

            // Handle video_file upload
            if ($request->hasFile('video_file') && $request->file('video_file')->isValid()) {
                if ($event->video_file && File::exists(public_path($event->video_file))) {
                    File::delete(public_path($event->video_file));
                    Log::info('Deleted old video: ' . $event->video_file);
                }

                $uploadPath = public_path('uploads/events');
                if (!File::exists($uploadPath)) {
                    File::makeDirectory($uploadPath, 0755, true);
                    Log::info('Created uploads/events directory at: ' . $uploadPath);
                }

                $file = $request->file('video_file');
                $fileName = time() . '_' . $file->getClientOriginalName();
                $file->move($uploadPath, $fileName);
                $data['video_file'] = 'uploads/events/' . $fileName;
                Log::info('New video uploaded: ' . $data['video_file']);
            } else {
                $data['video_file'] = $event->video_file;
                Log::info('No new video uploaded, preserving existing: ' . ($event->video_file ?: 'none'));
            }

            $event->fill($data)->save();
            Log::info('Event record updated successfully for ID: ' . $event_id);

            return response()->json([
                'message' => 'Event record updated successfully.',
                'event' => $event->fresh()
            ], 200);
        } catch (Exception $e) {
            Log::error('Error updating event record for ID ' . $event_id . ': ' . $e->getMessage(), [
                'exception' => get_class($e),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['error' => 'Failed to update event record.', 'details' => $e->getMessage()], 500);
        }
    }

    /**
     * Remove the specified event record.
     */
    public function destroy($event_id)
    {
        try {
            $event = Event::find($event_id);
            if (!$event) {
                Log::warning('Event record not found for ID: ' . $event_id);
                return response()->json(['message' => 'Event record not found'], 404);
            }

            // Delete img_file if it exists
            if ($event->img_file && File::exists(public_path($event->img_file))) {
                File::delete(public_path($event->img_file));
                Log::info('Deleted image: ' . $event->img_file);
            }

            // Delete video_file if it exists
            if ($event->video_file && File::exists(public_path($event->video_file))) {
                File::delete(public_path($event->video_file));
                Log::info('Deleted video: ' . $event->video_file);
            }

            $event->delete();
            Log::info('Event record deleted successfully for ID: ' . $event_id);

            return response()->json(['message' => 'Event record deleted successfully'], 200);
        } catch (Exception $e) {
            Log::error('Error deleting event record: ' . $e->getMessage(), [
                'exception' => get_class($e),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['error' => 'Failed to delete event record.', 'details' => $e->getMessage()], 500);
        }
    }
}