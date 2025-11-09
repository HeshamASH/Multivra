import { SavedDesign } from '../types';

const STORAGE_KEY = 'ai_interior_designs';

/**
 * Retrieves all saved designs from local storage.
 * @returns An array of SavedDesign objects.
 */
export const getSavedDesigns = (): SavedDesign[] => {
    try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch (error) {
        console.error("Failed to retrieve saved designs from local storage:", error);
        return [];
    }
};

/**
 * Saves a new design to local storage.
 * @param designToSave The design object to save (without id and timestamp).
 * @returns The updated array of all saved designs.
 */
export const saveDesign = (designToSave: Omit<SavedDesign, 'id' | 'timestamp'>): SavedDesign[] => {
    const designs = getSavedDesigns();
    const newDesign: SavedDesign = {
        ...designToSave,
        id: `design-${Date.now()}`,
        timestamp: Date.now(),
    };
    // Add the new design to the beginning of the array
    const updatedDesigns = [newDesign, ...designs];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDesigns));
    return updatedDesigns;
};

/**
 * Deletes a design from local storage by its ID.
 * @param id The ID of the design to delete.
 * @returns The updated array of all saved designs.
 */
export const deleteDesign = (id: string): SavedDesign[] => {
    const designs = getSavedDesigns();
    const updatedDesigns = designs.filter(d => d.id !== id);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDesigns));
    return updatedDesigns;
};
