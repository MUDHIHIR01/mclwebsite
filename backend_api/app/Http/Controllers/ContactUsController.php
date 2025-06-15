<?php

namespace App\Http\Controllers;

use App\Models\ContactUs;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Exception;

class ContactUsController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum')->except(['index', 'show','allContactUs']);
    }

    public function allContactUs()
    {
        try {
            $contacts = ContactUs::orderBy('contactus_id', 'desc')->get();
            return response()->json(['contacts' => $contacts], 200);
        } catch (Exception $e) {
            \Log::error('Error fetching contact records: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch contact records.'], 500);
        }
    }

    
    public function index()
    {
        try {
            $contacts = ContactUs::orderBy('contactus_id', 'desc')->get();
            return response()->json(['contacts' => $contacts], 200);
        } catch (Exception $e) {
            \Log::error('Error fetching contact records: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch contact records.'], 500);
        }
    }


        public function contactDropDown()
{
    try {
        $contactUsDropdown = ContactUs::select('contactus_id', 'category')
            ->orderBy('contactus_id', 'desc')
            ->get();

        return response()->json(['contactUsDropdown' => $contactUsDropdown], 200);
    } catch (Exception $e) {
        \Log::error('Error fetching contact dropdown data: ' . $e->getMessage());
        return response()->json(['error' => 'Failed to fetch contact dropdown data.'], 500);
    }
}

    public function store(Request $request)
    {
        \Log::info('Contact store request data: ', $request->all());

        $validator = Validator::make($request->all(), [
            'category' => 'required|string|max:100',
            'description' => 'nullable|string',
            'img_file' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'url_link' => 'nullable|url|max:255',
        ]);

        if ($validator->fails()) {
            \Log::warning('Validation failed for Contact store: ', $validator->errors()->toArray());
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $data = $validator->validated();

            if ($request->hasFile('img_file') && $request->file('img_file')->isValid()) {
                $image = $request->file('img_file');
                $imageName = time() . '_' . preg_replace('/\s+/', '_', $image->getClientOriginalName());
                $uploadPath = public_path('uploads/contact_images');
                
                if (!file_exists($uploadPath)) {
                    mkdir($uploadPath, 0755, true);
                }

                $image->move($uploadPath, $imageName);
                $data['img_file'] = 'Uploads/contact_images/' . $imageName;
                \Log::info('Contact image uploaded: ' . $data['img_file']);
            }

            $contact = ContactUs::create($data);
            return response()->json(['message' => 'Contact record created successfully', 'contact' => $contact], 201);
        } catch (Exception $e) {
            \Log::error('Error creating contact record: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create contact record.', 'details' => $e->getMessage()], 500);
        }
    }

    public function show($contactus_id)
    {
        $contact = ContactUs::find($contactus_id);

        if (!$contact) {
            return response()->json(['message' => 'Contact record not found'], 404);
        }

        return response()->json(['contact' => $contact], 200);
    }

    public function update(Request $request, $contactus_id)
    {
        \Log::info('Contact update request data: ', $request->all());

        $contact = ContactUs::find($contactus_id);
        if (!$contact) {
            return response()->json(['message' => 'Contact record not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'category' => 'required|string|max:100',
            'description' => 'nullable|string',
            'img_file' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'url_link' => 'nullable|url|max:255',
        ]);

        if ($validator->fails()) {
            \Log::warning('Validation failed for Contact update: ', $validator->errors()->toArray());
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $data = $validator->validated();

            if ($request->hasFile('img_file') && $request->file('img_file')->isValid()) {
                if ($contact->img_file && file_exists(public_path($contact->img_file))) {
                    unlink(public_path($contact->img_file));
                    \Log::info('Deleted old contact image: ' . $contact->img_file);
                }

                $image = $request->file('img_file');
                $imageName = time() . '_' . preg_replace('/\s+/', '_', $image->getClientOriginalName());
                $uploadPath = public_path('Uploads/contact_images');
                
                if (!file_exists($uploadPath)) {
                    mkdir($uploadPath, 0755, true);
                }

                $image->move($uploadPath, $imageName);
                $data['img_file'] = 'Uploads/contact_images/' . $imageName;
                \Log::info('New contact image uploaded: ' . $data['img_file']);
            } else {
                $data['img_file'] = $contact->img_file;
            }

            $contact->fill($data)->save();
            return response()->json(['message' => 'Contact record updated successfully.', 'contact' => $contact->fresh()], 200);
        } catch (Exception $e) {
            \Log::error('Error updating contact record: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update contact record.', 'details' => $e->getMessage()], 500);
        }
    }

    public function destroy($contactus_id)
    {
        $contact = ContactUs::find($contactus_id);
        if (!$contact) {
            return response()->json(['message' => 'Contact record not found'], 404);
        }

        try {
            if ($contact->img_file && file_exists(public_path($contact->img_file))) {
                unlink(public_path($contact->img_file));
                \Log::info('Deleted contact image: ' . $contact->img_file);
            }

            $contact->delete();
            return response()->json(['message' => 'Contact record deleted successfully'], 200);
        } catch (Exception $e) {
            \Log::error('Error deleting contact record: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to delete contact record.', 'details' => $e->getMessage()], 500);
        }
    }
}