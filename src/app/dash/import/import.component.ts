import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ProjectField } from '@app/dash/import/shared/interfaces/project-field';
import { CsvFieldMapModel } from '@app/dash/import/shared/models/csv-field-map-model';
import { IconDefinition } from '@fortawesome/fontawesome-common-types';
import { faBrain } from '@fortawesome/free-solid-svg-icons/faBrain';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons/faExclamationTriangle';
import { faLongArrowAltRight } from '@fortawesome/free-solid-svg-icons/faLongArrowAltRight';
import { faShieldAlt } from '@fortawesome/free-solid-svg-icons/faShieldAlt';
import { faSpellCheck } from '@fortawesome/free-solid-svg-icons/faSpellCheck';
import { isValid, parse } from 'date-fns';
import Fuse from 'fuse.js';
import FuseResult = Fuse.FuseResult;

@Component({
  selector: 'app-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss'],
})
export class ImportComponent implements OnInit {

  readonly faLongArrowAltRight: IconDefinition = faLongArrowAltRight;
  readonly faSpellCheck: IconDefinition = faSpellCheck;
  readonly faExclamationTriangle: IconDefinition = faExclamationTriangle;
  readonly faBrain: IconDefinition = faBrain;
  readonly faShieldAlt: IconDefinition = faShieldAlt;

  /**
   * Date regular expression.
   */
  private readonly dateRegex: RegExp = new RegExp([
    '^(?:(?:31(\\/|-|\\.)(?:0?[13578]|1[02]|(?:Jan|Mar|May|Jul|Aug|Oct|Dec)))\\1|',
    '(?:(?:29|30)(\\/|-|\\.)(?:0?[1,3-9]|1[0-2]|(?:Jan|Mar|Apr|May|Jun|Jul|Aug|Sep',
    '|Oct|Nov|Dec))\\2))(?:(?:1[6-9]|[2-9]\\d)?\\d{2})$|^(?:29(\\/|-|\\.)(?:0?2|(?',
    ':Feb))\\3(?:(?:(?:1[6-9]|[2-9]\\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16',
    '|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\\d|2[0-8])(\\/|-|\\.)(?:(?:0?[1',
    '-9]|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep))|(?:1[0-2]|(?:Oct|Nov|Dec)))\\4(?',
    ':(?:1[6-9]|[2-9]\\d)?\\d{2})$'].join(''));

  /**
   * An extra check for validation a date.
   */
  private readonly extraDateRegex: RegExp = /^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/;

  /**
   * Make a view query and get input native element reference which it's type is {@link ElementRef}.
   */
  @ViewChild('fileElement', { static: false }) private fileElement: ElementRef;

  /**
   * Array that contains list of {@see ProjectField}. It's purpose is to show list of project fields,
   * so the user can map their uploaded CSV column header field with project's fields.
   *
   * @see ProjectField
   */
  readonly projectFields: ProjectField[] = [{
    label: 'Wallet',
    field: 'wallet',
  }, {
    label: 'Category',
    field: 'category',
  }, {
    label: 'Amount',
    field: 'amount',
  }, {
    label: 'Time',
    field: 'time',
  }, {
    label: 'Date',
    field: 'date',
  }, {
    label: 'Note',
    field: 'note',
  }];

  /**
   * Options required by Fuse.JS.
   *
   * @see Fuse
   */
  private readonly fuseOptions: Fuse.IFuseOptions<ProjectField> = {
    shouldSort: true,
    threshold: 0.6,
    location: 0,
    distance: 100,
    minMatchCharLength: 1,
    includeScore: true,
    keys: ['label', 'field'],
  };

  /**
   * FuseJs instance which has {@link projectFields} as it's list and {@link fuseOptions} as it's options.
   * It's purpose is to search through {@link projectFields} array and finds a match for given field name.
   */
  private fuse: Fuse<ProjectField> = new Fuse<ProjectField>(
    this.projectFields,
    this.fuseOptions,
  );

  /**
   * CSV headers fields.
   */
  private headers: string[] = [];

  /**
   * CSV header fields values
   *
   * @see headers
   */
  private dataSet: string[][] = [];

  /**
   * List of CSV field models.
   */
  dataSource: CsvFieldMapModel[] = [];

  /**
   * Selected file.
   */
  file: File;

  /**
   * Number of expenses in an CSV file.
   */
  expensesScanned: number;

  /**
   * Current step.
   */
  step: number;

  constructor() {
    this.step = 1;
  }

  ngOnInit(): void {
  }

  /**
   * On CSV file selected
   */
  onFileSelected(): void {
    /**
     * Store selected file
     */
    this.file = this.fileElement.nativeElement.files[0];
    /**
     * Check if selected file is a CSV format
     */
    if (!this.file.name.endsWith('.csv')) {
      /**
       * Show error.
       */
      console.log('SELECTED FILE IS NOT A CSV FORMAT');
      // this.matSnackBar.open('Selected file is not a CSV format');
      /**
       * Remove selected file.
       */
      this.removeFile();
      return;
    }
    /**
     * Instantiate InsertAttachment model by {@link file selected file}
     */
    // this.insertAttachment = new InsertAttachment(this.file);
    /**
     * The FileReader object lets web applications asynchronously read the contents of files (or raw data buffers)
     * stored on the user's computer, using File or Blob objects to specify the file or data to read.
     *
     * @see FileReader
     */
    const fileReader: FileReader = new FileReader();
    /**
     * Read uploaded CSV file as text.
     */
    fileReader.readAsText(this.file);
    /**
     * On file load and read callback.
     */
    fileReader.onload = (): void => {
      /**
       * Get all strings inside uploaded CSV file.
       */
      const csvString: string = fileReader.result as string;
      const fileLines: string[] = csvString.split(/\r\n|\n/).filter((line: string): string => line);
      if (!fileLines.length) {
        /**
         * Show error
         */
        console.log('EMPTY CSV FILE');
        // this.matSnackBar.open('Empty CSV file detected!');
        this.removeFile();
        return;
      }
      this.headers = fileLines[0].split(',');
      this.dataSet = fileLines.slice(1).map((line: string): string[] => line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/));
      /**
       * Scan expenses inside the file.
       */
      this.expensesScanned = fileLines.length - 1;
      /**
       * Set table data.
       */
      this.dataSource = this.headers.map((field: string, index: number): CsvFieldMapModel => {
        return new CsvFieldMapModel({
          name: field,
          helpText: this.dataSet[0][index],
          mapField: 'DONT_MAP_FIELD',
          foundDuplicate: false,
          index,
          mappedAutomatically: false,
          valuePercentage: 0,
        });
      });
      /**
       * Auto-map CSV column header field with project's based on field name.
       */
      this.dataSource.forEach((field: CsvFieldMapModel): void => {
        let validValues = 0;
        let validDates = 0;
        let validTimes = 0;

        this.dataSet.forEach((line: string[], index: number): void => {
          /**
           * Get value based on CSV column header index.
           */
          const value: string = line[field.index];
          /**
           * Check if value is not empty.
           */
          if (value.trim() !== '') {
            validValues++;
          }
          /**
           * Check if value is a valid date.
           */
          if (this.dateRegex.test(value.trim()) || this.extraDateRegex.test(value.trim())) {
            validDates++;
          }
          /**
           * Check if value is a valid time.
           */
          if (isValid(parse(value.trim(), 'HH:mm:ss', new Date())) ||
            isValid(parse(value.trim(), 'HH:mm', new Date())) ||
            isValid(parse(value.trim(), 'hh:mm a', new Date()))) {
            validTimes++;
          }
        });
        field.valuePercentage = this.getPercentage(validValues);
        field.validDates = validDates;
        field.validTimes = validTimes;
        /**
         * Search into {@link projectFields} and find relative and approximate match based on given field name.
         */
        const fuseResult: FuseResult<ProjectField>[] = this.fuse.search<ProjectField>(field.name);
        /**
         * Auto-map field
         */
        if (fuseResult.length && fuseResult[0].score < 0.15) {
          /**
           * @description
           *
           * Determines whether or not field is already mapped to found result.
           * This helps prevent duplicated mapped fields.
           */
          const alreadyMapped: boolean = this.dataSource
            .some((csvFieldMap: CsvFieldMapModel): boolean => csvFieldMap.mapField === fuseResult[0].item.field);
          /**
           * If field is already mapped to found result, then prevent setting it to the result.
           */
          if (alreadyMapped) {
            return;
          }
          field.mapField = fuseResult[0].item.field;
          field.mappedAutomatically = true;
        }
        /**
         * If more than 60% passed date validation then map field.
         */
        if ((this.getPercentage(validDates) * 100) >= 60 && !field.mappedAutomatically) {
          field.mapField = 'date';
          field.mappedAutomatically = true;
        }
        /**
         * If more than 60% passed time validation then map field.
         */
        if ((this.getPercentage(validTimes) * 100) >= 60 && !field.mappedAutomatically) {
          field.mapField = 'time';
          field.mappedAutomatically = true;
        }
      });
    };
  }

  /**
   * Start converting the CSV into JSON.
   */
  build(): void {
    if (this.dataSource.filter((field: CsvFieldMapModel): boolean => field.foundDuplicate).length > 0) {
      /**
       * Present a snackbar which will let user know that we found duplicated mapped fields
       * @todo Show toaster - Oops! found duplicated mapped fields.
       */
      return;
    }
    /**
     * @description
     *
     * Contains list of unwanted fields indexes
     *
     * Loop into [header fields]{@link headers} and filter them to get 'DONT_MAP_FIELD'.
     */
    const indexList: number[] = [];
    /**
     * Generate CSV header columns based on mapped fields
     */
    this.headers = this.dataSource
      .sort((a: CsvFieldMapModel, b: CsvFieldMapModel): number => {
        return (a.index > b.index) ? 1 : -1;
      })
      .map<string>((field: CsvFieldMapModel, index: number): string => {
        if (field.mapField === 'DONT_MAP_FIELD') {
          indexList.push(index);
        }
        return field.mapField ? field.mapField : field.name;
      });

    /**
     * New file lines.
     */
    let newFileLines: string[][] = [...[this.headers], ...this.dataSet];
    /**
     * Loop into each line and keep those who are not included in {@link indexList}.
     */
    newFileLines = newFileLines.map((line: string[]): string[] => {
      return line.filter((value: string, index: number): boolean => !indexList.includes(index));
    });
  }

  /**
   * Remove file and it's purpose is to remove selected CSV file and let user reselect again
   */
  removeFile(): void {
    this.file = null;
    this.expensesScanned = 0;
    this.fileElement.nativeElement.value = '';
    this.dataSource = [];
  }

  /**
   * Fine duplicate mapped fields and marked them as duplicated.
   */
  foundDuplicate(): void {
    this.dataSource.forEach((field: CsvFieldMapModel): void => {
      if (!field.runDuplicateValidation()) {
        field.foundDuplicate = false;
        return;
      }
      field.foundDuplicate = this.dataSource
        .map((csvField: CsvFieldMapModel): string => csvField.mapField)
        .filter((mapField: string): boolean => mapField === field.mapField).length > 1;
    });
  }

  /**
   * @param field Project field.
   *
   * @returns Get project field label based on given field name.
   */
  getProjectFieldLabel(field: string): string {
    return this.projectFields.find((projectField: ProjectField): boolean => projectField.field === field).label;
  }

  /**
   * Get value percentage based on given value divided by expenses scanned count {@link expensesScanned}.
   *
   * @param value A number to calculate it's percentage from number of expenses scanned.
   *
   * @returns Given value's percentage calculated from number of expenses scanned.
   */
  private getPercentage(value: number): number {
    return (value / this.expensesScanned);
  }
}
