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
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDesigns));
    } catch (error) {
        console.error("Failed to save design to local storage:", error);
        // Check for QuotaExceededError (the name and code can vary between browsers)
        if (error instanceof DOMException && (error.name === 'QuotaExceededError' || error.code === 22)) {
            throw new Error("STORAGE_FULL::Could not save design. Please delete some old designs to make space.");
        }
        throw new Error("An unexpected error occurred while saving your design.");
    }
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
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDesigns));
    } catch (error) {
        console.error("Failed to update local storage after deletion:", error);
        throw new Error("Could not update saved designs after deletion.");
    }
    return updatedDesigns;
};