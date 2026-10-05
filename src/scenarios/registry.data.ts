// Scenario metadata with no React imports, so it can be shared by the app and
// by scripts/gen-manifest.ts, which publishes it as scenarios.json for the
// external Playwright/axe-core and NVDA test repositories.

export type Variant = 'accessible' | 'broken';
export const VARIANTS: Variant[] = ['accessible', 'broken'];

export type Category = 'live' | 'disclosure' | 'forms' | 'dynamic';

export const CATEGORY_TITLES: Record<Category, string> = {
  live: 'Live regions & alerts',
  disclosure: 'Disclosure widgets',
  forms: 'Forms & validation',
  dynamic: 'Dynamic content',
};

/** A step an automated test performs to reach the scenario's dynamic state. */
export interface SetupStep {
  action: 'click' | 'fill' | 'press' | 'waitFor';
  /** data-testid of the target element. */
  testid: string;
  /** Text for `fill`, key name for `press` (Playwright key syntax). */
  value?: string;
}

export interface ScenarioMeta {
  id: string;
  /** Route path, served under the hash router: `#<path>?variant=...` */
  path: string;
  title: string;
  category: Category;
  description: string;
  /** What is deliberately wrong with the broken variant. */
  flaw: string;
  /** Default ms before async updates happen; override with `?delay=`. */
  defaultDelay: number;
  /** Steps that put the page into its dynamic state before auditing. */
  setup: SetupStep[];
  /** Key phrases a screen reader should announce for each variant. */
  expected: { accessible: string[]; broken: string[] };
  axe: {
    /** axe-core rule ids the broken variant must violate (after setup). */
    brokenRules: string[];
    /** True when the flaw is invisible to axe and only a screen reader catches it. */
    nvdaOnly: boolean;
    note?: string;
  };
}

export const SCENARIOS: ScenarioMeta[] = [
  // ---- Live regions & alerts ----
  {
    id: 'live-polite',
    path: '/live/polite',
    title: 'Polite status message (4.1.3)',
    category: 'live',
    description: 'Adding an item to the cart updates a status message after a delay.',
    flaw: 'The status text changes inside a plain div with no live region.',
    defaultDelay: 1000,
    setup: [
      { action: 'click', testid: 'trigger' },
      { action: 'waitFor', testid: 'status-text' },
    ],
    expected: { accessible: ['Item added to cart. 1 item in cart.'], broken: [] },
    axe: { brokenRules: [], nvdaOnly: true },
  },
  {
    id: 'live-alert',
    path: '/live/alert',
    title: 'Assertive error alert (3.3.1, 3.3.3)',
    category: 'live',
    description: 'Saving fails and an error message appears.',
    flaw: 'The error container has aria-live="off", so the error is visual only.',
    defaultDelay: 1000,
    setup: [
      { action: 'click', testid: 'trigger' },
      { action: 'waitFor', testid: 'error-text' },
    ],
    expected: {
      accessible: ['Error: Could not save changes. Check your connection and try again.'],
      broken: [],
    },
    axe: { brokenRules: [], nvdaOnly: true },
  },
  {
    id: 'live-toast',
    path: '/live/toast',
    title: 'Auto-dismissing toast (4.1.3)',
    category: 'live',
    description: 'Sending a message shows a toast that disappears after a few seconds.',
    flaw: 'The live region is mounted together with its content, which screen readers often miss.',
    defaultDelay: 500,
    setup: [
      { action: 'click', testid: 'trigger' },
      { action: 'waitFor', testid: 'toast' },
    ],
    expected: { accessible: ['Message sent'], broken: [] },
    axe: { brokenRules: [], nvdaOnly: true },
  },
  {
    id: 'live-loading',
    path: '/live/loading',
    title: 'Loading indicator (4.1.3)',
    category: 'live',
    description: 'Loading search results shows a spinner, then the results.',
    flaw: 'The spinner is an unlabeled image and no loading or completion text is announced.',
    defaultDelay: 2000,
    setup: [
      { action: 'click', testid: 'trigger' },
      { action: 'waitFor', testid: 'spinner' },
    ],
    expected: { accessible: ['Loading results', 'Loaded 5 results'], broken: [] },
    axe: {
      brokenRules: ['svg-img-alt'],
      nvdaOnly: false,
      note: 'Audit while the spinner is visible; use a large ?delay= to hold that state.',
    },
  },

  // ---- Disclosure widgets ----
  {
    id: 'disclosure-accordion',
    path: '/disclosure/accordion',
    title: 'Accordion (2.1.1, 4.1.2)',
    category: 'disclosure',
    description: 'Three FAQ sections that expand and collapse.',
    flaw: 'Headers are clickable divs: no button role, not focusable, no expanded state.',
    defaultDelay: 0,
    setup: [{ action: 'click', testid: 'trigger' }],
    expected: { accessible: ['What is NVDA?', 'button', 'expanded'], broken: [] },
    axe: { brokenRules: [], nvdaOnly: true },
  },
  {
    id: 'disclosure-dialog',
    path: '/disclosure/dialog',
    title: 'Modal dialog (4.1.2, 2.4.3, 2.1.1)',
    category: 'disclosure',
    description: 'A button opens a settings dialog with a form.',
    flaw: 'The dialog has no accessible name, no aria-modal, and no focus management or Escape key.',
    defaultDelay: 0,
    setup: [{ action: 'click', testid: 'trigger' }],
    expected: { accessible: ['Profile settings', 'dialog', 'Display name'], broken: [] },
    axe: { brokenRules: ['aria-dialog-name'], nvdaOnly: false },
  },
  {
    id: 'disclosure-tabs',
    path: '/disclosure/tabs',
    title: 'Tabs (4.1.2, 2.1.1, 1.3.1, 2.4.7)',
    category: 'disclosure',
    description: 'Three tabs switch between account panels.',
    flaw: 'Tabs are not in a tablist, have no selected state, and are not keyboard operable.',
    defaultDelay: 0,
    setup: [],
    expected: { accessible: ['tab', 'selected', '1 of 3'], broken: [] },
    axe: { brokenRules: ['aria-required-parent'], nvdaOnly: false },
  },
  {
    id: 'disclosure-menu',
    path: '/disclosure/menu',
    title: 'Menu button (4.1.2, 2.1.1, 1.3.1)',
    category: 'disclosure',
    description: 'An actions button opens a menu of commands.',
    flaw: 'The icon-only button has no name, no popup/expanded state, and the menu is a plain list.',
    defaultDelay: 0,
    setup: [{ action: 'click', testid: 'trigger' }],
    expected: { accessible: ['Actions', 'menu button', 'Duplicate'], broken: [] },
    axe: { brokenRules: ['button-name'], nvdaOnly: false },
  },

  // ---- Forms & validation ----
  {
    id: 'forms-inline',
    path: '/forms/inline-validation',
    title: 'Inline validation (3.3.1, 1.4.1, 3.3.3, 1.3.1)',
    category: 'forms',
    description: 'An email field is validated when it loses focus.',
    flaw: 'Errors are shown only by a red border and unassociated text; no aria-invalid.',
    defaultDelay: 0,
    setup: [
      { action: 'fill', testid: 'email', value: 'not-an-email' },
      { action: 'click', testid: 'check' },
    ],
    expected: {
      accessible: ['invalid entry', 'Enter a valid email address, like name@example.com'],
      broken: [],
    },
    axe: { brokenRules: [], nvdaOnly: true },
  },
  {
    id: 'forms-summary',
    path: '/forms/error-summary',
    title: 'Error summary on submit (3.3.1, 2.4.3, 4.1.3)',
    category: 'forms',
    description: 'Submitting an empty form reports every error.',
    flaw: 'Errors render silently next to fields; focus stays on the submit button.',
    defaultDelay: 0,
    setup: [{ action: 'click', testid: 'trigger' }],
    expected: { accessible: ['There are 2 problems with your submission'], broken: [] },
    axe: { brokenRules: [], nvdaOnly: true },
  },
  {
    id: 'forms-labels',
    path: '/forms/labels',
    title: 'Labels, hints and required fields (1.3.1, 3.3.2, 4.1.2)',
    category: 'forms',
    description: 'A short form with a required field and a hint.',
    flaw: 'Label text is not associated with inputs and "required" is only an asterisk.',
    defaultDelay: 0,
    setup: [],
    expected: { accessible: ['Full name', 'required', 'As shown on your ID'], broken: [] },
    axe: { brokenRules: ['label'], nvdaOnly: false },
  },
  {
    id: 'forms-success',
    path: '/forms/success',
    title: 'Submission confirmation (4.1.3, 2.4.3, 3.2.2)',
    category: 'forms',
    description: 'Submitting feedback shows a confirmation message.',
    flaw: 'The form is silently replaced by a message and keyboard focus is lost.',
    defaultDelay: 1000,
    setup: [
      { action: 'fill', testid: 'feedback', value: 'Great page' },
      { action: 'click', testid: 'trigger' },
      { action: 'waitFor', testid: 'success' },
    ],
    expected: { accessible: ['Thanks! Your feedback was submitted.'], broken: [] },
    axe: { brokenRules: [], nvdaOnly: true },
  },

  // ---- Dynamic content ----
  {
    id: 'dynamic-combobox',
    path: '/dynamic/combobox',
    title: 'Autocomplete combobox (2.1.1)',
    category: 'dynamic',
    description: 'Typing in a fruit field filters a list of suggestions.',
    flaw: 'Input has no combobox semantics; options are not in a listbox and the result count is silent.',
    defaultDelay: 0,
    setup: [{ action: 'fill', testid: 'combobox', value: 'ap' }],
    expected: { accessible: ['results available', 'Apple'], broken: [] },
    axe: { brokenRules: ['aria-required-parent', 'list'], nvdaOnly: false },
  },
  {
    id: 'dynamic-load-more',
    path: '/dynamic/load-more',
    title: 'Load more (4.1.3, 2.4.3, 1.1.3)',
    category: 'dynamic',
    description: 'A button appends more articles to a list.',
    flaw: 'Items are appended silently and focus is lost when the button disappears.',
    defaultDelay: 800,
    setup: [
      { action: 'click', testid: 'trigger' },
      { action: 'waitFor', testid: 'item-6' },
    ],
    expected: { accessible: ['Showing 10 of 15 articles', 'Article 6'], broken: [] },
    axe: { brokenRules: [], nvdaOnly: true },
  },
  {
    id: 'dynamic-sort-table',
    path: '/dynamic/sortable-table',
    title: 'Sortable table (4.1.2, 1.3.1)',
    category: 'dynamic',
    description: 'Column headers sort a table of employees.',
    flaw: 'Headers are clickable cells with no button, no aria-sort, and no caption.',
    defaultDelay: 0,
    setup: [{ action: 'click', testid: 'sort-name' }],
    expected: { accessible: ['Sorted by Name, ascending'], broken: [] },
    axe: { brokenRules: [], nvdaOnly: true },
  },
  {
    id: 'dynamic-inject',
    path: '/dynamic/delayed-content',
    title: 'Delayed content injection (4.1.3, 1.3.1, 2.4.6)',
    category: 'dynamic',
    description: 'Recommendations load in automatically a moment after the page opens.',
    flaw: 'Content appears with no announcement, and its heading is styled text rather than a heading.',
    defaultDelay: 2000,
    setup: [{ action: 'waitFor', testid: 'injected' }],
    expected: { accessible: ['3 recommendations loaded'], broken: [] },
    axe: { brokenRules: [], nvdaOnly: true },
  },
];

export function scenarioHref(s: ScenarioMeta, variant: Variant): string {
  return `#${s.path}?variant=${variant}`;
}
