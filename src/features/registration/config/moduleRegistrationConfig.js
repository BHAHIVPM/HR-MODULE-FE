import attendanceService from '../../attendance/services/attendanceService';
import assetService from '../../asset/services/assetService';
import documentService from '../../document/services/documentService';
import holidayService from '../../holiday/services/holidayService';
import leaveApplicationService from '../../leave/services/leaveApplicationService';
import leaveMasterService from '../../leave/services/leaveMasterService';
import mainGroupService from '../../menu/services/mainGroupService';
import menuService from '../../menu/services/menuService';
import subGroupService from '../../menu/services/subGroupService';
import departmentService from '../../organization/services/departmentService';
import designationService from '../../organization/services/designationService';
import bankDetailsService from '../../payroll/services/bankDetailsService';
import salaryService from '../../payroll/services/salaryService';
import performanceReviewService from '../../performance/services/performanceReviewService';
import roleService from '../../role-assignment/services/roleService';
import employeeShiftService from '../../shift/services/employeeShiftService';
import shiftService from '../../shift/services/shiftService';

/** Today's date in the yyyy-MM-dd format used by the date inputs. */
const today = () => new Date().toISOString().split('T')[0];

const ACTIVE_INACTIVE = [
  { value: 'ACTIVE', label: 'ACTIVE' },
  { value: 'INACTIVE', label: 'INACTIVE' },
];

const YES_NO = [
  { value: 'YES', label: 'YES' },
  { value: 'NO', label: 'NO' },
];

const toInt = (value) =>
  value === '' || value === null || value === undefined ? null : parseInt(value, 10);

const toFloat = (value) =>
  value === '' || value === null || value === undefined ? 0 : parseFloat(value);

/**
 * Registration (add) screens — one entry per module insert operation.
 * Every entry renders the shared DynamicForm through ModuleRegistrationPage,
 * so a "+" menu action always opens a full screen instead of a modal.
 *
 * Entry shape:
 * {
 *   key, label, listPath, listTab?, pageTitle, title, subtitle, submitLabel,
 *   successMessage, lookups?: string[], fields: DynamicFormField[],
 *   validate?: (values) => string | null,
 *   transform?: (values) => payload,
 *   save: (payload) => Promise,
 * }
 */
export const MODULE_REGISTRATIONS = {
  holiday: {
    key: 'holiday',
    label: 'Holiday',
    listPath: '/holidays',
    listTitle: 'Holiday Calendar',
    pageTitle: 'Holiday Registration',
    title: 'Holiday Registration',
    subtitle: 'Add a new holiday to the company holiday calendar.',
    submitLabel: 'Save Holiday',
    successMessage: 'Holiday saved successfully.',
    fields: [
      {
        name: 'holidayName',
        label: 'Holiday Name',
        type: 'text',
        required: true,
        placeholder: 'e.g. Independence Day',
      },
      {
        name: 'holidayDate',
        label: 'Holiday Date',
        type: 'date',
        required: true,
        defaultValue: today(),
      },
      {
        name: 'holidayType',
        label: 'Holiday Type',
        type: 'select',
        required: true,
        defaultValue: 'NATIONAL',
        options: [
          { value: 'NATIONAL', label: 'NATIONAL' },
          { value: 'FESTIVAL', label: 'FESTIVAL' },
          { value: 'OPTIONAL', label: 'OPTIONAL' },
          { value: 'RESTRICTED', label: 'RESTRICTED' },
        ],
      },
      {
        name: 'location',
        label: 'Location Scope',
        type: 'text',
        defaultValue: 'ALL',
        placeholder: 'e.g. ALL or Chennai',
      },
      {
        name: 'description',
        label: 'Description',
        type: 'textarea',
        rows: 2,
        colSpan: 2,
      },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        required: true,
        defaultValue: 'ACTIVE',
        options: ACTIVE_INACTIVE,
      },
    ],
    save: (payload) => holidayService.save(payload),
  },

  asset: {
    key: 'asset',
    label: 'Asset',
    listPath: '/assets',
    listTitle: 'Asset Inventory',
    pageTitle: 'Asset Registration',
    title: 'Asset Registration',
    subtitle: 'Register a new company asset into the inventory.',
    submitLabel: 'Save Asset',
    successMessage: 'New asset registered.',
    fields: [
      {
        name: 'assetCode',
        label: 'Asset Code',
        type: 'text',
        required: true,
        placeholder: 'e.g. AST-LAP-001',
      },
      {
        name: 'assetName',
        label: 'Asset Name',
        type: 'text',
        required: true,
        placeholder: 'e.g. MacBook Pro M3 16-inch',
      },
      {
        name: 'assetType',
        label: 'Asset Type',
        type: 'select',
        required: true,
        defaultValue: 'LAPTOP',
        options: [
          { value: 'LAPTOP', label: 'LAPTOP' },
          { value: 'DESKTOP', label: 'DESKTOP' },
          { value: 'MOBILE', label: 'MOBILE' },
          { value: 'MONITOR', label: 'MONITOR' },
          { value: 'ID_CARD', label: 'ID_CARD' },
          { value: 'ACCESSORY', label: 'ACCESSORY' },
          { value: 'FURNITURE', label: 'FURNITURE' },
          { value: 'OTHER', label: 'OTHER' },
        ],
      },
      {
        name: 'serialNumber',
        label: 'Serial Number',
        type: 'text',
        placeholder: 'Manufacturer serial number',
      },
      {
        name: 'assetCondition',
        label: 'Asset Condition',
        type: 'select',
        defaultValue: 'NEW',
        options: [
          { value: 'NEW', label: 'NEW' },
          { value: 'GOOD', label: 'GOOD' },
          { value: 'DAMAGED', label: 'DAMAGED' },
          { value: 'LOST', label: 'LOST' },
        ],
      },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        required: true,
        defaultValue: 'AVAILABLE',
        options: [
          { value: 'AVAILABLE', label: 'AVAILABLE' },
          { value: 'ISSUED', label: 'ISSUED' },
          { value: 'RETURNED', label: 'RETURNED' },
          { value: 'DAMAGED', label: 'DAMAGED' },
          { value: 'LOST', label: 'LOST' },
          { value: 'RETIRED', label: 'RETIRED' },
        ],
      },
      {
        name: 'remarks',
        label: 'Remarks',
        type: 'text',
        colSpan: 2,
      },
    ],
    save: (payload) => assetService.save(payload),
  },

  attendance: {
    key: 'attendance',
    label: 'Attendance',
    listPath: '/attendance',
    listTitle: 'Attendance Log',
    pageTitle: 'Attendance Registration',
    title: 'Log Attendance Record',
    subtitle: 'Record a manual attendance entry for an employee.',
    submitLabel: 'Save Attendance',
    successMessage: 'Attendance record logged.',
    fields: [
      {
        name: 'employeeId',
        label: 'Employee ID',
        type: 'number',
        required: true,
        placeholder: 'Employee ID',
      },
      {
        name: 'attendanceDate',
        label: 'Attendance Date',
        type: 'date',
        required: true,
        defaultValue: today(),
      },
      {
        name: 'checkInTime',
        label: 'Check In Time',
        type: 'time',
        defaultValue: '09:00',
      },
      {
        name: 'checkOutTime',
        label: 'Check Out Time',
        type: 'time',
        defaultValue: '18:00',
      },
      {
        name: 'workedHours',
        label: 'Worked Hours',
        type: 'number',
        defaultValue: '9.0',
      },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        required: true,
        defaultValue: 'PRESENT',
        options: [
          { value: 'PRESENT', label: 'PRESENT' },
          { value: 'ABSENT', label: 'ABSENT' },
          { value: 'HALF_DAY', label: 'HALF_DAY' },
          { value: 'ON_LEAVE', label: 'ON_LEAVE' },
          { value: 'HOLIDAY', label: 'HOLIDAY' },
          { value: 'WEEK_OFF', label: 'WEEK_OFF' },
        ],
      },
      {
        name: 'remarks',
        label: 'Remarks',
        type: 'text',
        colSpan: 2,
      },
    ],
    transform: (values) => ({
      ...values,
      employeeId: toInt(values.employeeId),
      workedHours: values.workedHours ? toFloat(values.workedHours) : null,
    }),
    save: (payload) => attendanceService.save(payload),
  },

  document: {
    key: 'document',
    label: 'Document',
    listPath: '/documents',
    listTitle: 'Document Repository',
    pageTitle: 'Document Registration',
    title: 'Upload Document Record',
    subtitle: 'Log an employee document into the document vault.',
    submitLabel: 'Save Document',
    successMessage: 'Document uploaded and logged.',
    fields: [
      {
        name: 'employeeId',
        label: 'Employee ID',
        type: 'number',
        required: true,
        placeholder: 'Employee ID',
      },
      {
        name: 'documentType',
        label: 'Document Type',
        type: 'select',
        required: true,
        defaultValue: 'ID_PROOF',
        options: [
          { value: 'ID_PROOF', label: 'ID_PROOF' },
          { value: 'ADDRESS_PROOF', label: 'ADDRESS_PROOF' },
          { value: 'OFFER_LETTER', label: 'OFFER_LETTER' },
          { value: 'APPOINTMENT_LETTER', label: 'APPOINTMENT_LETTER' },
          { value: 'PAN_CARD', label: 'PAN_CARD' },
          { value: 'AADHAR_CARD', label: 'AADHAR_CARD' },
          { value: 'PASSPORT', label: 'PASSPORT' },
          { value: 'RESUME', label: 'RESUME' },
          { value: 'EDUCATIONAL_CERTIFICATE', label: 'EDUCATIONAL_CERTIFICATE' },
          { value: 'RELIEVING_LETTER', label: 'RELIEVING_LETTER' },
          { value: 'OTHER', label: 'OTHER' },
        ],
      },
      {
        name: 'documentName',
        label: 'Document Name',
        type: 'text',
        required: true,
        placeholder: 'e.g. Passport Front & Back Scan',
        colSpan: 2,
      },
      {
        name: 'documentNumber',
        label: 'Document Number / Reference',
        type: 'text',
        placeholder: 'e.g. Z1234567',
      },
      {
        name: 'filePath',
        label: 'File Path / Storage Key',
        type: 'text',
        placeholder: '/uploads/docs/passport.pdf',
      },
      {
        name: 'issuedDate',
        label: 'Issued Date',
        type: 'date',
      },
      {
        name: 'expiryDate',
        label: 'Expiry Date',
        type: 'date',
      },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        required: true,
        defaultValue: 'ACTIVE',
        colSpan: 2,
        options: ACTIVE_INACTIVE,
      },
    ],
    transform: (values) => ({
      ...values,
      employeeId: toInt(values.employeeId),
    }),
    save: (payload) => documentService.save(payload),
  },

  'performance-review': {
    key: 'performance-review',
    label: 'Appraisal',
    listPath: '/performance-reviews',
    listTitle: 'Performance Reviews',
    pageTitle: 'Appraisal Initiation',
    title: 'Initiate Performance Review',
    subtitle: 'Start a new appraisal cycle for an employee.',
    submitLabel: 'Save Appraisal',
    successMessage: 'Appraisal cycle initiated.',
    fields: [
      {
        name: 'employeeId',
        label: 'Employee ID',
        type: 'number',
        required: true,
        placeholder: 'Employee ID',
      },
      {
        name: 'reviewerId',
        label: 'Reviewer Manager ID',
        type: 'number',
        placeholder: 'Employee ID of the reviewer',
      },
      {
        name: 'reviewCycle',
        label: 'Review Cycle',
        type: 'text',
        required: true,
        defaultValue: '2026-H1',
        placeholder: 'e.g. 2026-H1 or Annual-2026',
        colSpan: 2,
      },
      {
        name: 'reviewPeriodStart',
        label: 'Period Start',
        type: 'date',
        required: true,
        defaultValue: `${new Date().getFullYear()}-01-01`,
      },
      {
        name: 'reviewPeriodEnd',
        label: 'Period End',
        type: 'date',
        required: true,
        defaultValue: `${new Date().getFullYear()}-06-30`,
      },
      { name: 'achievements', label: 'Key Achievements', type: 'textarea', rows: 2, colSpan: 2 },
      { name: 'strengths', label: 'Strengths', type: 'textarea', rows: 2, colSpan: 2 },
      { name: 'areasOfImprovement', label: 'Areas Of Improvement', type: 'textarea', rows: 2, colSpan: 2 },
      { name: 'goalsForNextCycle', label: 'Goals For Next Cycle', type: 'textarea', rows: 2, colSpan: 2 },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        required: true,
        defaultValue: 'DRAFT',
        colSpan: 2,
        options: [
          { value: 'DRAFT', label: 'DRAFT' },
          { value: 'SUBMITTED', label: 'SUBMITTED' },
          { value: 'REVIEWED', label: 'REVIEWED' },
          { value: 'ACKNOWLEDGED', label: 'ACKNOWLEDGED' },
        ],
      },
    ],
    transform: (values) => ({
      ...values,
      employeeId: toInt(values.employeeId),
      reviewerId: toInt(values.reviewerId),
    }),
    save: (payload) => performanceReviewService.save(payload),
  },

  department: {
    key: 'department',
    label: 'Department',
    listPath: '/organization',
    listTab: 'departments',
    listTitle: 'Departments',
    pageTitle: 'Department Registration',
    title: 'Add Department',
    subtitle: 'Create a new department in the organization structure.',
    submitLabel: 'Save Department',
    successMessage: 'Department created successfully.',
    fields: [
      {
        name: 'departmentCode',
        label: 'Department Code',
        type: 'text',
        required: true,
        placeholder: 'e.g. DEPT_HR',
      },
      {
        name: 'departmentName',
        label: 'Department Name',
        type: 'text',
        required: true,
        placeholder: 'e.g. Human Resources',
      },
      {
        name: 'departmentHeadId',
        label: 'Department Head Employee ID',
        type: 'number',
        placeholder: 'Employee ID',
        colSpan: 2,
      },
      { name: 'description', label: 'Description', type: 'textarea', rows: 3, colSpan: 2 },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        required: true,
        defaultValue: 'ACTIVE',
        colSpan: 2,
        options: ACTIVE_INACTIVE,
      },
    ],
    transform: (values) => ({
      ...values,
      departmentHeadId: values.departmentHeadId ? toInt(values.departmentHeadId) : null,
    }),
    save: (payload) => departmentService.save(payload),
  },

  designation: {
    key: 'designation',
    label: 'Designation',
    listPath: '/organization',
    listTab: 'designations',
    listTitle: 'Designations',
    pageTitle: 'Designation Registration',
    title: 'Add Designation',
    subtitle: 'Create a new designation and map it to a department.',
    submitLabel: 'Save Designation',
    successMessage: 'Designation created successfully.',
    lookups: ['departments'],
    fields: [
      {
        name: 'designationCode',
        label: 'Designation Code',
        type: 'text',
        required: true,
        placeholder: 'e.g. DESIG_ENG_SR',
      },
      {
        name: 'designationName',
        label: 'Designation Name',
        type: 'text',
        required: true,
        placeholder: 'e.g. Senior Software Engineer',
      },
      {
        name: 'departmentId',
        label: 'Department',
        type: 'select',
        placeholder: 'Select Department (Optional)',
        colSpan: 2,
        options: ({ departments = [] }) =>
          departments.map((dept) => ({
            value: String(dept.departmentId),
            label: `${dept.departmentName} (${dept.departmentCode})`,
          })),
      },
      { name: 'gradeLevel', label: 'Grade Level', type: 'text', placeholder: 'e.g. L4' },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        required: true,
        defaultValue: 'ACTIVE',
        options: ACTIVE_INACTIVE,
      },
    ],
    transform: (values) => ({
      ...values,
      departmentId: values.departmentId ? toInt(values.departmentId) : null,
    }),
    save: (payload) => designationService.save(payload),
  },

  shift: {
    key: 'shift',
    label: 'Shift',
    listPath: '/shifts',
    listTab: 'shifts',
    listTitle: 'Shift Master',
    pageTitle: 'Shift Registration',
    title: 'Create Shift Master',
    subtitle: 'Define a new shift timing for the organization.',
    submitLabel: 'Save Shift',
    successMessage: 'Shift created successfully.',
    fields: [
      {
        name: 'shiftCode',
        label: 'Shift Code',
        type: 'text',
        required: true,
        placeholder: 'e.g. SHIFT_DAY_GEN',
      },
      {
        name: 'shiftName',
        label: 'Shift Name',
        type: 'text',
        required: true,
        placeholder: 'e.g. General Day Shift (9 AM - 6 PM)',
      },
      { name: 'startTime', label: 'Start Time', type: 'time', required: true, defaultValue: '09:00' },
      { name: 'endTime', label: 'End Time', type: 'time', required: true, defaultValue: '18:00' },
      {
        name: 'breakDurationMinutes',
        label: 'Break Duration (Minutes)',
        type: 'number',
        defaultValue: 60,
      },
      {
        name: 'weeklyOffDays',
        label: 'Weekly Off Days',
        type: 'text',
        defaultValue: 'SATURDAY,SUNDAY',
        placeholder: 'e.g. SATURDAY,SUNDAY',
      },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        required: true,
        defaultValue: 'ACTIVE',
        options: ACTIVE_INACTIVE,
      },
    ],
    transform: (values) => ({
      ...values,
      breakDurationMinutes: values.breakDurationMinutes ? toInt(values.breakDurationMinutes) : 0,
    }),
    save: (payload) => shiftService.save(payload),
  },

  'employee-shift': {
    key: 'employee-shift',
    label: 'Shift Assignment',
    listPath: '/shifts',
    listTab: 'assignments',
    listTitle: 'Employee Shift Roster',
    pageTitle: 'Shift Assignment',
    title: 'Assign Shift to Employee',
    subtitle: 'Roster an employee onto a shift for a date range.',
    submitLabel: 'Assign Shift',
    successMessage: 'Shift assigned to employee successfully.',
    lookups: ['shifts'],
    fields: [
      {
        name: 'employeeId',
        label: 'Employee ID',
        type: 'number',
        required: true,
        placeholder: 'Enter Employee ID',
      },
      {
        name: 'shiftId',
        label: 'Shift',
        type: 'select',
        required: true,
        placeholder: 'Select Shift',
        options: ({ shifts = [] }) =>
          shifts.map((shift) => ({
            value: String(shift.shiftId),
            label: `${shift.shiftName} (${shift.startTime} - ${shift.endTime})`,
          })),
      },
      { name: 'effectiveFrom', label: 'Effective From', type: 'date', required: true, defaultValue: today() },
      { name: 'effectiveTo', label: 'Effective To (Optional)', type: 'date' },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        required: true,
        defaultValue: 'ACTIVE',
        colSpan: 2,
        options: ACTIVE_INACTIVE,
      },
    ],
    transform: (values) => ({
      ...values,
      employeeId: toInt(values.employeeId),
      shiftId: toInt(values.shiftId),
    }),
    save: (payload) => employeeShiftService.assign(payload),
  },

  'leave-application': {
    key: 'leave-application',
    label: 'Leave Application',
    listPath: '/leaves',
    listTab: 'applications',
    listTitle: 'Leave Applications',
    pageTitle: 'Leave Application',
    title: 'Apply For Leave',
    subtitle: 'Submit a leave application for an employee.',
    submitLabel: 'Submit Application',
    successMessage: 'Leave application submitted successfully.',
    lookups: ['leaveTypes'],
    fields: [
      {
        name: 'employeeId',
        label: 'Employee ID',
        type: 'number',
        required: true,
        placeholder: 'Employee ID',
      },
      {
        name: 'leaveTypeId',
        label: 'Leave Type',
        type: 'select',
        required: true,
        placeholder: 'Select Leave Type',
        options: ({ leaveTypes = [] }) =>
          leaveTypes.map((type) => ({
            value: String(type.leaveTypeId),
            label: `${type.leaveTypeName} (${type.leaveTypeCode})`,
          })),
      },
      { name: 'fromDate', label: 'From Date', type: 'date', required: true, defaultValue: today() },
      { name: 'toDate', label: 'To Date', type: 'date', required: true, defaultValue: today() },
      {
        name: 'noOfDays',
        label: 'Number of Days',
        type: 'number',
        required: true,
        defaultValue: 1,
      },
      { name: 'reason', label: 'Reason', type: 'textarea', rows: 3, colSpan: 2 },
    ],
    transform: (values) => ({
      ...values,
      status: 'PENDING',
      employeeId: toInt(values.employeeId),
      leaveTypeId: toInt(values.leaveTypeId),
      noOfDays: toFloat(values.noOfDays),
    }),
    save: (payload) => leaveApplicationService.apply(payload),
  },

  'leave-type': {
    key: 'leave-type',
    label: 'Leave Type',
    listPath: '/leaves',
    listTab: 'types',
    listTitle: 'Leave Types',
    pageTitle: 'Leave Type Registration',
    title: 'Create Leave Type',
    subtitle: 'Configure a new leave type for the organization.',
    submitLabel: 'Save Leave Type',
    successMessage: 'New leave type created.',
    fields: [
      {
        name: 'leaveTypeCode',
        label: 'Leave Code',
        type: 'text',
        required: true,
        placeholder: 'e.g. CL, SL, EL',
      },
      {
        name: 'leaveTypeName',
        label: 'Leave Name',
        type: 'text',
        required: true,
        placeholder: 'e.g. Casual Leave',
      },
      {
        name: 'defaultDaysPerYear',
        label: 'Default Days Per Year',
        type: 'number',
        required: true,
        defaultValue: 12,
      },
      {
        name: 'carryForwardAllowed',
        label: 'Allow Carry Forward',
        type: 'checkbox',
        defaultValue: false,
      },
      {
        name: 'maxCarryForwardDays',
        label: 'Max Carry Forward Days',
        type: 'number',
        defaultValue: 0,
        hint: 'Only applied when carry forward is allowed',
      },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        required: true,
        defaultValue: 'ACTIVE',
        colSpan: 2,
        options: ACTIVE_INACTIVE,
      },
    ],
    transform: (values) => ({
      ...values,
      defaultDaysPerYear: toInt(values.defaultDaysPerYear),
      maxCarryForwardDays: values.carryForwardAllowed ? toInt(values.maxCarryForwardDays) : 0,
    }),
    save: (payload) => leaveMasterService.save(payload),
  },

  'salary-structure': {
    key: 'salary-structure',
    label: 'Salary Structure',
    listPath: '/payroll-management',
    listTab: 'salary',
    listTitle: 'Salary Structures',
    pageTitle: 'Salary Structure Registration',
    title: 'Create Salary Structure',
    subtitle: 'Define the salary components and deductions for an employee.',
    submitLabel: 'Save Salary Structure',
    successMessage: 'Salary structure saved.',
    fields: [
      {
        name: 'employeeId',
        label: 'Employee ID',
        type: 'number',
        required: true,
        placeholder: 'Employee ID',
        colSpan: 2,
      },
      { name: 'basicSalary', label: 'Basic Salary', type: 'number', required: true, defaultValue: 30000 },
      { name: 'hra', label: 'HRA', type: 'number', defaultValue: 12000 },
      { name: 'conveyanceAllowance', label: 'Conveyance', type: 'number', defaultValue: 2000 },
      { name: 'medicalAllowance', label: 'Medical', type: 'number', defaultValue: 1500 },
      { name: 'specialAllowance', label: 'Special Allowance', type: 'number', defaultValue: 5000 },
      { name: 'otherAllowance', label: 'Other Allowance', type: 'number', defaultValue: 0 },
      { name: 'providentFund', label: 'Provident Fund (PF)', type: 'number', defaultValue: 3600 },
      { name: 'professionalTax', label: 'Prof. Tax (PT)', type: 'number', defaultValue: 200 },
      { name: 'incomeTax', label: 'Income Tax (TDS)', type: 'number', defaultValue: 1000 },
      { name: 'otherDeductions', label: 'Other Deductions', type: 'number', defaultValue: 0 },
      {
        name: 'effectiveFrom',
        label: 'Effective From',
        type: 'date',
        required: true,
        defaultValue: today(),
      },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        required: true,
        defaultValue: 'ACTIVE',
        options: ACTIVE_INACTIVE,
      },
    ],
    transform: (values) => ({
      ...values,
      employeeId: toInt(values.employeeId),
      basicSalary: toFloat(values.basicSalary),
      hra: toFloat(values.hra),
      conveyanceAllowance: toFloat(values.conveyanceAllowance),
      medicalAllowance: toFloat(values.medicalAllowance),
      specialAllowance: toFloat(values.specialAllowance),
      otherAllowance: toFloat(values.otherAllowance),
      providentFund: toFloat(values.providentFund),
      professionalTax: toFloat(values.professionalTax),
      incomeTax: toFloat(values.incomeTax),
      otherDeductions: toFloat(values.otherDeductions),
    }),
    save: (payload) => salaryService.save(payload),
  },

  'bank-details': {
    key: 'bank-details',
    label: 'Bank Account',
    listPath: '/payroll-management',
    listTab: 'bank',
    listTitle: 'Bank Accounts',
    pageTitle: 'Bank Account Registration',
    title: 'Add Bank Account',
    subtitle: 'Register an employee bank account used for salary disbursement.',
    submitLabel: 'Save Bank Details',
    successMessage: 'Bank details saved.',
    fields: [
      {
        name: 'employeeId',
        label: 'Employee ID',
        type: 'number',
        required: true,
        placeholder: 'Employee ID',
      },
      {
        name: 'bankName',
        label: 'Bank Name',
        type: 'text',
        required: true,
        placeholder: 'e.g. HDFC Bank',
      },
      { name: 'branchName', label: 'Branch Name', type: 'text', placeholder: 'e.g. Anna Nagar' },
      { name: 'accountNumber', label: 'Account Number', type: 'text', required: true },
      { name: 'ifscCode', label: 'IFSC Code', type: 'text', required: true, placeholder: 'e.g. HDFC0001234' },
      {
        name: 'accountHolderName',
        label: 'Account Holder Name',
        type: 'text',
        required: true,
        colSpan: 2,
      },
      {
        name: 'accountType',
        label: 'Account Type',
        type: 'select',
        required: true,
        defaultValue: 'SAVINGS',
        options: [
          { value: 'SAVINGS', label: 'SAVINGS' },
          { value: 'CURRENT', label: 'CURRENT' },
        ],
      },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        required: true,
        defaultValue: 'ACTIVE',
        options: ACTIVE_INACTIVE,
      },
      {
        name: 'isPrimary',
        label: 'Set Primary Account for Salary Disbursement',
        type: 'checkbox',
        defaultValue: true,
        colSpan: 2,
      },
    ],
    transform: (values) => ({
      ...values,
      employeeId: toInt(values.employeeId),
    }),
    save: (payload) => bankDetailsService.save(payload),
  },

  role: {
    key: 'role',
    label: 'Role',
    listPath: '/role-assignment',
    listTab: 'role-creation',
    listTitle: 'Role Creation',
    pageTitle: 'Role Registration',
    title: 'Create New Role',
    subtitle: 'Define a new role for user access management.',
    submitLabel: 'Create Role',
    successMessage: 'Role created successfully.',
    fields: [
      {
        name: 'roleName',
        label: 'Role Name',
        type: 'text',
        required: true,
        placeholder: 'Enter role name',
        maxLength: 100,
      },
      {
        name: 'roleCategory',
        label: 'Role Category',
        type: 'select',
        placeholder: '— None (Superadmin) —',
        options: [
          { value: 'ADMIN', label: 'ADMIN' },
          { value: 'USER', label: 'USER' },
        ],
      },
      { name: 'remarks', label: 'Remarks', type: 'textarea', rows: 3, colSpan: 2, maxLength: 500 },
      {
        name: 'system',
        label: 'Is System Role',
        type: 'checkbox',
        defaultValue: false,
        colSpan: 2,
        hint: 'System roles are protected and have elevated privileges',
      },
    ],
    transform: (values) => ({
      ...values,
      editable: true,
      assignment: false,
    }),
    save: (payload) => roleService.createRole(payload),
  },

  'main-group': {
    key: 'main-group',
    label: 'Main Group',
    listPath: '/menu-management',
    listTab: 'mainGroups',
    listTitle: 'Main Groups',
    pageTitle: 'Main Group Registration',
    title: 'Add Main Group',
    subtitle: 'Create a new main group for the application menu.',
    submitLabel: 'Save Main Group',
    successMessage: 'Main Group added successfully.',
    fields: [
      {
        name: 'mainGroupName',
        label: 'Main Group Name',
        type: 'text',
        required: true,
        placeholder: 'e.g. Employees',
        hint: 'Only letters and spaces are allowed',
      },
      {
        name: 'iconPath',
        label: 'Icon Path',
        type: 'text',
        placeholder: 'e.g. fas fa-users',
        colSpan: 2,
      },
    ],
    validate: (values) =>
      /^[A-Za-z\s]+$/.test(values.mainGroupName || '')
        ? null
        : 'Main Group name must contain only letters and spaces.',
    save: (payload) => mainGroupService.add(payload),
  },

  'sub-group': {
    key: 'sub-group',
    label: 'Sub Group',
    listPath: '/menu-management',
    listTab: 'subGroups',
    listTitle: 'Sub Groups',
    pageTitle: 'Sub Group Registration',
    title: 'Add Sub Group',
    subtitle: 'Create a new sub group that groups related menu items.',
    submitLabel: 'Save Sub Group',
    successMessage: 'Sub Group added successfully.',
    fields: [
      {
        name: 'subGroupName',
        label: 'Sub Group Name',
        type: 'text',
        required: true,
        placeholder: 'e.g. Reports',
        hint: 'Only letters and spaces are allowed',
        colSpan: 2,
      },
    ],
    validate: (values) =>
      /^[A-Za-z\s]+$/.test(values.subGroupName || '')
        ? null
        : 'Sub Group name must contain only letters and spaces.',
    save: (payload) => subGroupService.add(payload),
  },

  'menu-item': {
    key: 'menu-item',
    label: 'Menu Item',
    listPath: '/menu-management',
    listTab: 'menuItems',
    listTitle: 'Menu Items',
    pageTitle: 'Menu Item Registration',
    title: 'Add Menu Item',
    subtitle: 'Register a new menu item with its route and privileges.',
    submitLabel: 'Save Menu Item',
    successMessage: 'Menu Item added successfully.',
    lookups: ['mainGroups', 'subGroups'],
    fields: [
      {
        name: 'menuName',
        label: 'Menu Name',
        type: 'text',
        required: true,
        placeholder: 'e.g. Employee List',
        hint: 'Only letters and spaces are allowed',
      },
      {
        name: 'componentPath',
        label: 'Component Path',
        type: 'text',
        required: true,
        placeholder: 'e.g. /employee/list',
      },
      {
        name: 'mainGroupId',
        label: 'Main Group',
        type: 'select',
        required: true,
        placeholder: 'Select Main Group',
        options: ({ mainGroups = [] }) =>
          mainGroups.map((group) => ({
            value: String(group.mainGroupId),
            label: group.mainGroupName,
          })),
      },
      {
        name: 'subGroupId',
        label: 'Sub Group',
        type: 'select',
        placeholder: 'None',
        options: ({ subGroups = [] }) =>
          subGroups.map((group) => ({
            value: String(group.subGroupId),
            label: group.subGroupName,
          })),
      },
      {
        name: 'addOption',
        label: 'Add Option',
        type: 'select',
        required: true,
        defaultValue: 'YES',
        options: YES_NO,
      },
      {
        name: 'editOption',
        label: 'Edit Option',
        type: 'select',
        required: true,
        defaultValue: 'YES',
        options: YES_NO,
      },
      {
        name: 'deleteOption',
        label: 'Delete Option',
        type: 'select',
        required: true,
        defaultValue: 'YES',
        options: YES_NO,
      },
      {
        name: 'isPrivilege',
        label: 'Is Privilege',
        type: 'select',
        required: true,
        defaultValue: 'NO',
        options: YES_NO,
      },
    ],
    validate: (values) =>
      /^[A-Za-z\s]+$/.test(values.menuName || '')
        ? null
        : 'Menu name must contain only letters and spaces.',
    transform: (values) => ({
      ...values,
      mainGroupId: toInt(values.mainGroupId),
      subGroupId: values.subGroupId ? toInt(values.subGroupId) : null,
    }),
    save: (payload) => menuService.add(payload),
  },
};

/**
 * Lookup loaders for registration-screen dropdowns.
 * Keys match the `lookups` arrays declared in MODULE_REGISTRATIONS entries.
 */
export const REGISTRATION_LOOKUPS = {
  departments: () => departmentService.findAll(),
  shifts: () => shiftService.findAll(),
  leaveTypes: () => leaveMasterService.findAll(),
  mainGroups: () => mainGroupService.getAll(),
  subGroups: () => subGroupService.getAll(),
};

/**
 * Registration screen routes. Keys match MODULE_REGISTRATIONS plus the
 * dedicated screens that already existed for user / employee / client.
 */
export const REGISTRATION_ROUTES = {
  user: '/registrations/user',
  employee: '/registrations/employee',
  client: '/registrations/client',
  holiday: '/registrations/holiday',
  asset: '/registrations/asset',
  attendance: '/registrations/attendance',
  document: '/registrations/document',
  'performance-review': '/registrations/performance-review',
  department: '/registrations/department',
  designation: '/registrations/designation',
  shift: '/registrations/shift',
  'employee-shift': '/registrations/employee-shift',
  'leave-application': '/registrations/leave-application',
  'leave-type': '/registrations/leave-type',
  'salary-structure': '/registrations/salary-structure',
  'bank-details': '/registrations/bank-details',
  role: '/registrations/role',
  'main-group': '/registrations/main-group',
  'sub-group': '/registrations/sub-group',
  'menu-item': '/registrations/menu-item',
};

/**
 * Module list route -> registration screen opened by its "+" menu action.
 * Keys are the componentPath values configured for the backend menu items.
 */
export const MODULE_ADD_PATHS = {
  '/employees': REGISTRATION_ROUTES.employee,
  '/employee': REGISTRATION_ROUTES.employee,
  '/userData': REGISTRATION_ROUTES.user,
  '/users': REGISTRATION_ROUTES.user,
  '/clients': REGISTRATION_ROUTES.client,
  '/organization': REGISTRATION_ROUTES.department,
  '/shifts': REGISTRATION_ROUTES.shift,
  '/attendance': REGISTRATION_ROUTES.attendance,
  '/leaves': REGISTRATION_ROUTES['leave-application'],
  '/holidays': REGISTRATION_ROUTES.holiday,
  '/payroll-management': REGISTRATION_ROUTES['salary-structure'],
  '/payroll': REGISTRATION_ROUTES['salary-structure'],
  '/assets': REGISTRATION_ROUTES.asset,
  '/documents': REGISTRATION_ROUTES.document,
  '/performance-reviews': REGISTRATION_ROUTES['performance-review'],
  '/role-assignment': REGISTRATION_ROUTES.role,
  '/menu-management': REGISTRATION_ROUTES['main-group'],
};

const normalizePath = (path) => {
  if (!path) return '';
  const withoutQuery = String(path).split('?')[0].split('#')[0];
  const trimmed = withoutQuery.replace(/\/+$/, '');
  return trimmed === '' ? '/' : trimmed.toLowerCase();
};

const NORMALIZED_ADD_PATHS = Object.entries(MODULE_ADD_PATHS).reduce((acc, [path, addPath]) => {
  acc[normalizePath(path)] = addPath;
  return acc;
}, {});

/** Resolves the registration screen route for a module list route (or null). */
export const resolveAddPath = (path) => NORMALIZED_ADD_PATHS[normalizePath(path)] || null;

/** Returns a module list route including its tab query parameter. */
export const getRegistrationListPath = (config) => {
  if (!config) return '/dashboard';
  return config.listTab ? `${config.listPath}?tab=${config.listTab}` : config.listPath;
};
