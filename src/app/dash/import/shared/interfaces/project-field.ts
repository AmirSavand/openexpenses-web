/**
 * **UI purpose**
 *
 * Represents a single Project field that is being used to map CSV header column field.
 */
export interface ProjectField {
  /**
   * Display name which is human-readable and it's purpose is to show it in UI.
   */
  label: string;
  /**
   * Field name which is available in project.
   */
  field: string;
}
