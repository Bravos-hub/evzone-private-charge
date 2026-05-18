import {
  APP_NAME,
  CONNECTOR_TYPES,
  DEFAULT_COORDS,
  NAV_ITEMS,
  OCPP_VERSIONS,
} from './constants';

describe('application constants', () => {
  it('defines a coherent navigation model', () => {
    const paths = NAV_ITEMS.map((item) => item.path);

    expect(APP_NAME).toContain('EVzone');
    expect(paths).toContain('/');
    expect(paths).toContain('/settings');
    expect(new Set(paths).size).toBe(paths.length);
    expect(NAV_ITEMS.every((item) => item.label && item.icon)).toBe(true);
  });

  it('keeps charger defaults in supported ranges', () => {
    const [latitude, longitude] = DEFAULT_COORDS;

    expect(CONNECTOR_TYPES).toEqual(
      expect.arrayContaining(['Type 2', 'CCS 2']),
    );
    expect(OCPP_VERSIONS).toEqual(expect.arrayContaining(['1.6J', '2.0.1']));
    expect(latitude).toBeGreaterThanOrEqual(-90);
    expect(latitude).toBeLessThanOrEqual(90);
    expect(longitude).toBeGreaterThanOrEqual(-180);
    expect(longitude).toBeLessThanOrEqual(180);
  });
});
