import { describe, it, expect } from 'vitest';
import { getMissingKeys } from './validate-env-lib';

describe('Environment Validator', () => {
    it('should identify missing keys', () => {
        const example = `KEY1=value1
KEY2=value2
KEY3=value3`;
        const actual = 'KEY1=realvalue1';
        
        const missing = getMissingKeys(example, actual);
        expect(missing).toEqual(['KEY2', 'KEY3']);
    });

    it('should return empty array if all keys are present', () => {
        const example = `KEY1=value1
KEY2=value2`;
        const actual = `KEY1=v1
KEY2=v2
KEY3=v3`;
        
        const missing = getMissingKeys(example, actual);
        expect(missing).toEqual([]);
    });

    it('should handle empty files', () => {
        expect(getMissingKeys('', '')).toEqual([]);
        expect(getMissingKeys('KEY1=v1', '')).toEqual(['KEY1']);
    });

    it('should ignore comments and empty lines', () => {
        const example = `# Comment

KEY1=v1

# Another
KEY2=v2`;
        const actual = 'KEY1=realv1';
        
        const missing = getMissingKeys(example, actual);
        expect(missing).toEqual(['KEY2']);
    });
});
