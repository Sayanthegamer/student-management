import { describe, it, expect } from 'vitest';
import { convertToCSV, parseCSV, validateAndCoerceStudent } from './csvHelpers';

describe('csvHelpers', () => {
    describe('convertToCSV', () => {
        it('should handle simple data', () => {
            const data = [{ name: 'John', class: '10' }];
            const csv = convertToCSV(data);
            expect(csv).toBe('name,class\nJohn,10');
        });

        it('should handle commas in values', () => {
            const data = [{ name: 'Doe, John', class: '10' }];
            const csv = convertToCSV(data);
            expect(csv).toBe('name,class\n"Doe, John",10');
        });

        it('should handle newlines in values', () => {
            const data = [{ name: 'John\nDoe', class: '10' }];
            const csv = convertToCSV(data);
            expect(csv).toBe('name,class\n"John\nDoe",10');
        });

        it('should handle quotes in values', () => {
            const data = [{ name: 'John \"Boss\" Doe', class: '10' }];
            const csv = convertToCSV(data);
            expect(csv).toBe('name,class\n"John ""Boss"" Doe",10');
        });
    });

    describe('parseCSV', () => {
        it('should parse simple CSV', () => {
            const csv = 'name,class,section,rollNo\nJohn,10,A,1';
            const result = parseCSV(csv);
            expect(result).toHaveLength(1);
            expect(result[0].name).toBe('John');
            expect(result[0].class).toBe('10');
        });

        it('should parse CSV with quoted values containing commas', () => {
            const csv = 'name,class,section,rollNo\n\"Doe, John\",10,A,1';
            const result = parseCSV(csv);
            expect(result).toHaveLength(1);
            expect(result[0].name).toBe('Doe, John');
        });

        it('should parse CSV with quoted values containing newlines', () => {
            const csv = 'name,class,section,rollNo\n\"John\nDoe\",10,A,1';
            const result = parseCSV(csv);
            expect(result).toHaveLength(1);
            expect(result[0].name).toBe('John\nDoe');
        });

        it('should parse CSV with escaped quotes', () => {
            const csv = 'name,class,section,rollNo\n\"John ""Boss"" Doe\",10,A,1';
            const result = parseCSV(csv);
            expect(result).toHaveLength(1);
            expect(result[0].name).toBe('John \"Boss\" Doe');
        });
    });
});
