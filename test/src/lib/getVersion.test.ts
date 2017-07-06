import { expect } from 'chai';
import getVersion from './../../../src/lib/getVersion';

describe('getVersion', () => {
  it('is function', () => {
    expect(typeof getVersion).to.equal('function');
  });

  it('returns the passed in version if valid', () => {
    const version = '1.0.0';

    expect(getVersion(version)).to.equal(version);
  });

  it('returns a timestamp string if passed in `latest`', () => {
    const version = 'latest';

    const result = getVersion(version);

    expect(typeof result).to.equal('string');
    expect(result).to.not.equal(version);
  });
});
