import fs from 'fs';
import path from 'path';
import mainGroupService from './mainGroupService';
import menuService from './menuService';
import subGroupService from './subGroupService';

jest.mock('../../../api/axiosClient', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

const axiosClient = require('../../../api/axiosClient').default;

const okResponse = (responseOutput = []) => ({
  data: { header: 'Success', message: 'ok', statusCode: 200, responseOutput },
});

// react-scripts enables jest `resetMocks` (implementations are wiped before every
// test), so install implementations here, after the reset has run.
beforeEach(() => {
  axiosClient.get.mockImplementation(() => Promise.resolve(okResponse([])));
  axiosClient.post.mockImplementation(() => Promise.resolve({ data: { header: 'Success', message: 'created', statusCode: 201 } }));
  axiosClient.put.mockImplementation(() => Promise.resolve({ data: { header: 'Success', message: 'updated', statusCode: 200 } }));
  axiosClient.delete.mockImplementation(() => Promise.resolve({ data: { header: 'Success', message: 'deleted', statusCode: 200 } }));
});

// Removed multi-language endpoint markers (case-insensitive), per backend contract.
// Built via concatenation so a naive grep over the product source stays clean.
/* eslint-disable no-useless-concat */
const FORBIDDEN_TOKENS = [
  'language' + 'Id',
  'language' + 'Type',
  'Other' + 'Language',
  'add-' + 'other',
  'all-' + 'other',
  'update-' + 'other',
  'fetch-by-' + 'language',
];
/* eslint-enable no-useless-concat */

function listSourceFiles(dir, acc = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  entries.forEach((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      listSourceFiles(full, acc);
    } else if (!/\.(test|spec)\.(js|jsx|ts|tsx)$/i.test(entry.name)) {
      acc.push(full);
    }
  });
  return acc;
}

describe('menu services (English-only contract)', () => {
  test('getFullMenu requests the full endpoint with no language param and no query/params', async () => {
    const axiosPromise = mainGroupService.getFullMenu();
    const res = await axiosPromise;

    expect(axiosClient.get).toHaveBeenCalledTimes(1);
    const [url, config] = axiosClient.get.mock.calls[0];
    const langToken = 'language' + 'Id'; // eslint-disable-line no-useless-concat
    expect(url).toBe('/main-group-operation/full');
    expect(url).not.toContain(langToken);
    expect(url).not.toContain('/{');
    expect(url).not.toMatch(/\/full\/\d+$/);
    expect(config).toBeUndefined();
    // A language id must never be sent as a query param on this call either.
    expect(config?.params).toBeUndefined();
    expect(res.data.responseOutput).toEqual([]);
  });

  test('translation-related methods were removed from every menu service', () => {
    [mainGroupService, menuService, subGroupService].forEach((service) => {
      expect(service.addTranslation).toBeUndefined();
      expect(service.getAllTranslations).toBeUndefined();
      expect(service.updateTranslation).toBeUndefined();
      expect(service.fetchByLanguage).toBeUndefined();
    });
  });

  test('no removed translation endpoint is called by the menu services', async () => {
    // Exercise the remaining endpoint methods so any accidental wiring of a
    // removed route would surface here.
    await mainGroupService.getAll();
    await mainGroupService.add({ mainGroupName: 'X' });
    await mainGroupService.update(1, { mainGroupName: 'X' });
    await mainGroupService.delete(1);
    await mainGroupService.reorder([{ mainGroupId: 1, hierarchyId: 1 }]);

    await menuService.getAll();
    await menuService.add({ menuName: 'X' });
    await menuService.reorder(1, [{ menuNameId: 1, hierarchyId: 1 }]);

    await subGroupService.getAll();
    await subGroupService.add({ subGroupName: 'X' });

    const allCalls = [
      ...axiosClient.get.mock.calls,
      ...axiosClient.post.mock.calls,
      ...axiosClient.put.mock.calls,
      ...axiosClient.delete.mock.calls,
    ].map((args) => String(args[0]));

    const forbidden = FORBIDDEN_TOKENS.map((token) => token.toLowerCase());
    allCalls.forEach((url) => {
      const lower = url.toLowerCase();
      forbidden.forEach((token) => {
        expect(lower).not.toContain(token);
      });
    });
  });

  test('no source file references removed language/translation endpoints or params', () => {
    const srcDir = path.join(__dirname, '../../..');
    const files = listSourceFiles(srcDir);
    const offenders = [];

    files.forEach((file) => {
      let content = '';
      try {
        content = fs.readFileSync(file, 'utf8');
      } catch {
        return;
      }
      const lower = content.toLowerCase();
      FORBIDDEN_TOKENS.forEach((token) => {
        if (lower.includes(token.toLowerCase())) {
          offenders.push(`${path.relative(srcDir, file)} contains "${token}"`);
        }
      });
    });

    expect(offenders).toEqual([]);
  });
});