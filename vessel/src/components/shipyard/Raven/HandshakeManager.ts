import { BirthProfile } from '../../services/ProfileVault';

export interface HandshakeState {
  date: string | null;  // ISO Date (YYYY-MM-DD)
  time: string | null;  // HH:MM (24hr)
  place: {
    name: string;
    lat: number;
    lng: number;
  } | null;
  name: string | null;  // Who is this profile for?
  is_complete: boolean;
}

export interface SlotUpdate {
  key: keyof HandshakeState;
  value: any;
  confidence: number; // 0-1
}

export class HandshakeManager {
  private state: HandshakeState;

  constructor() {
    this.state = {
      date: null,
      time: null,
      place: null,
      name: null,
      is_complete: false
    };
  }

  /**
   * Analyzes text to find birth data entities (Passive Detection).
   * This is a simple regex/heuristic based matching for now.
   * ideally this would be augmented by the LLM's own extraction.
   */
  public detectSlots(userInput: string): SlotUpdate[] {
    const updates: SlotUpdate[] = [];

    // 1. Date Detection (Very basic ISO or YYYY-MM-DD detection for prototype)
    const dateMatch = userInput.match(/\b(\d{4}-\d{2}-\d{2})\b/);
    if (dateMatch) {
      updates.push({ key: 'date', value: dateMatch[1], confidence: 0.95 });
    }

    // 2. Time Detection (HH:MM)
    const timeMatch = userInput.match(/\b([01]?[0-9]|2[0-3]):([0-5][0-9])\b/);
    if (timeMatch) {
      updates.push({ key: 'time', value: timeMatch[0], confidence: 0.9 });
    }

    // 3. Place Detection (Heuristic: "in [City]")
    // This is fragile and should rely on LLM tool calling in production, 
    // but useful for basic testing.
    const placeMatch = userInput.match(/in\s+([A-Z][a-zA-Z\s]+)/);
    if (placeMatch && placeMatch[1]) {
      // Mock geocoding for now
      updates.push({
        key: 'place',
        value: { name: placeMatch[1], lat: 0, lng: 0 },
        confidence: 0.6
      });
    }

    // 4. Name Detection (Heuristic: "for [Name]" or "I'm [Name]" or "my name is [Name]")
    const nameMatch = userInput.match(/(?:for|I'm|I am|my name is|name is|called)\s+([A-Z][a-zA-Z]+)/i);
    if (nameMatch && nameMatch[1]) {
      updates.push({ key: 'name', value: nameMatch[1].trim(), confidence: 0.8 });
    }

    return updates;
  }

  public getState(): HandshakeState {
    return { ...this.state };
  }

  /**
   * Set the name explicitly (useful when Raven asks and user responds)
   */
  public setName(name: string): void {
    this.state.name = name;
  }

  /**
   * Updates the state and checks for completion.
   */
  public update(updates: SlotUpdate[]): HandshakeState {
    updates.forEach(u => {
      if (u.confidence > 0.5) {
        if (u.key === 'place' && u.value && typeof u.value === 'object') {
          // careful merge for place
          this.state.place = u.value;
        } else {
          (this.state as any)[u.key] = u.value;
        }
      }
    });

    this.checkCompletion();
    return this.state;
  }

  private checkCompletion() {
    this.state.is_complete = !!(this.state.date && this.state.time && this.state.place);
  }

  /**
   * Generates the next question based on missing slots (Active Inquiry).
   * Returns null if complete.
   */
  public getNextInquiry(): string | null {
    if (this.state.is_complete) return null;

    if (!this.state.date) {
      return "On what day did the light first touch you? (YYYY-MM-DD)";
    }
    if (!this.state.time) {
      return "To calculate the precise angles, I need the moment the clock started. What time was it? (HH:MM)";
    }
    if (!this.state.place) {
      return "Where were you standing when you entered the stream? (City)";
    }

    return null;
  }

  /**
   * Converts a completed handshake into a BirthProfile for storage.
   * Requires name and relationship to be provided if not already set.
   */
  public toProfile(
    name?: string,
    relationship: BirthProfile['relationship'] = 'other'
  ): BirthProfile | null {
    if (!this.state.is_complete || !this.state.date || !this.state.time || !this.state.place) {
      console.warn('[HandshakeManager] Cannot convert to profile: handshake incomplete');
      return null;
    }

    const profileName = name || this.state.name || 'Unknown';

    return {
      id: '', // Will be assigned by ProfileVault
      name: profileName,
      birthDate: this.state.date,
      birthTime: this.state.time,
      birthCity: this.state.place.name,
      latitude: this.state.place.lat,
      longitude: this.state.place.lng,
      relationship,
      createdAt: Date.now(),
      lastUsedAt: Date.now()
    };
  }

  /**
   * Reset the handshake for a new subject
   */
  public reset(): void {
    this.state = {
      date: null,
      time: null,
      place: null,
      name: null,
      is_complete: false
    };
  }
}

