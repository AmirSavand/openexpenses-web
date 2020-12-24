import { CsvFieldMap } from 'src/app/dash/import/shared/interfaces/csv-field-map';

export class CsvFieldMapModel {
  static readonly whiteListFields: string[] = ['IGNORE_THIS_FIELD', 'DONT_MAP_FIELD'];
  /**
   * Field name founded in CSV header columns.
   */
  name: string;
  /**
   * Represents one real example of field values.
   */
  helpText: string;
  /**
   * Stores which Project field it has to map with.
   */
  mapField: string;
  /**
   * Determines whether or not found duplicate field.
   */
  foundDuplicate: boolean;
  /**
   * Index number in the list
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
  validDates: number;
  /**
   * Number of valid times (e.g. 02:03 AM).
   */
  validTimes: number;

  constructor(data: CsvFieldMap) {
    this.name = data.name;
    this.helpText = data.helpText;
    this.mapField = data.mapField;
    this.foundDuplicate = data.foundDuplicate;
    this.index = data.index;
    this.mappedAutomatically = data.mappedAutomatically;
    this.valuePercentage = data.valuePercentage;
    this.validDates = data.validDates || 0;
    this.validTimes = data.validTimes || 0;
  }

  runDuplicateValidation(): boolean {
    return !CsvFieldMapModel.whiteListFields.includes(this.mapField);
  }
}
