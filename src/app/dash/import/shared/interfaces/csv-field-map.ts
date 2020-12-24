/**
 * **UI purpose**
 *
 * Represents a single CSV header column field, which is being used to map uploaded
 * CSV header columns with project fields.
 *
 * @see ImportComponent
 */
export interface CsvFieldMap {
  /**
   * Field name founded in CSV header columns.
   */
  name: string;
  /**
   * Represents one real example of field values.
   */
  helpText: string;
  /**
   * Stores which project field it has to map with.
   */
  mapField: string;
  /**
   * Determines whether or not found duplicate field.
   */
  foundDuplicate: boolean;
  /**
   * Index number in the list.
   */
  index: number;
  /**
   * Determines whether this field was mapped automatically or not.
   */
  mappedAutomatically: boolean;
  /**
   * Number that represents percentage of un-empty values.
   */
  valuePercentage: number;
  /**
   * Number of valid dates.
   */
  validDates?: number;
  /**
   * Number of valid times (e.g 02:03 AM).
   */
  validTimes?: number;
}
