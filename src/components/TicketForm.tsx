"use client";

import { FormEvent, useMemo, useState } from "react";
import { GeoPoint, createTicket } from "@/lib/firebase";
import { PRIORITIES, type TicketInput, type TicketPriority } from "@/types/ticket";
import { useToast } from "@/components/ui/Toast";

const initialState = {
  title: "",
  description: "",
  priority: "MEDIUM" as TicketPriority,
  category: "",
  location: null as string | null,
  locationCoordinates: null as GeoPoint | null
};

export default function TicketForm() {
  const [formData, setFormData] = useState(initialState);
  const { notify } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const locationLabel = useMemo(() => formData.location ?? "No location captured", [formData.location]);

  const handleLocation = async () => {
    if (!("geolocation" in navigator)) {
      notify("Geolocation is not supported in this browser.", "error");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setFormData((prev) => ({
          ...prev,
          location: `${lat},${lng}`,
          locationCoordinates: new GeoPoint(lat, lng)
        }));
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
        notify("Location access denied. Please allow location permission.", "error");
      }
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formData.title.trim() || !formData.description.trim() || !formData.category.trim()) {
      notify("Please fill out all required fields.", "error");
      return;
    }

    setIsSubmitting(true);
    const payload: TicketInput = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      priority: formData.priority,
      category: formData.category.trim(),
      location: formData.location,
      locationCoordinates: formData.locationCoordinates
    };

    try {
      await createTicket(payload);
      notify("Ticket created successfully.", "success");
      setFormData(initialState);
    } catch {
      notify("Failed to create ticket.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-800 bg-panel p-6">
      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium">
          Title *
        </label>
        <input
          id="title"
          value={formData.title}
          onChange={(event) => setFormData((prev) => ({ ...prev, title: event.target.value }))}
          required
          className="w-full"
        />
      </div>
      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium">
          Description *
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(event) => setFormData((prev) => ({ ...prev, description: event.target.value }))}
          required
          rows={4}
          className="w-full"
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="priority" className="mb-1 block text-sm font-medium">
            Priority *
          </label>
          <select
            id="priority"
            value={formData.priority}
            onChange={(event) => setFormData((prev) => ({ ...prev, priority: event.target.value as TicketPriority }))}
            required
            className="w-full"
          >
            {PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="category" className="mb-1 block text-sm font-medium">
            Category *
          </label>
          <input
            id="category"
            value={formData.category}
            onChange={(event) => setFormData((prev) => ({ ...prev, category: event.target.value }))}
            required
            className="w-full"
          />
        </div>
      </div>
      <div className="rounded-md border border-slate-700 p-3">
        <p className="text-sm text-slate-300">Location (optional): {locationLabel}</p>
        <button
          type="button"
          onClick={() => void handleLocation()}
          disabled={isLocating}
          className="mt-2 rounded-md border border-slate-600 px-3 py-2 text-sm hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLocating ? "Capturing..." : "Use My Location"}
        </button>
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Creating Ticket..." : "Create Ticket"}
      </button>
    </form>
  );
}
