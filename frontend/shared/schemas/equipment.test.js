import { describe, expect, it } from 'vite-plus/test'
import { MAX_EQUIPMENT_FIELD_LENGTH, equipmentSchema } from '@shared/schemas/equipment'

describe('equipment schema', () => {
    const validEquipment = {
        equipmentName: 'Sony FX3 Cinema Camera',
        categoryId: 'Camera',
        shortDescription: 'Full-frame cinema line camera with XLR handle unit.',
        modelCode: 'ILME-FX3',
        serialNumber: 'SN-9021841',
        technicalSpecs: '4K 120p recording\nDual base ISO\n16-bit RAW output',
        status: 'available'
    }

    it('exports MAX_EQUIPMENT_FIELD_LENGTH as 255', () => {
        expect(MAX_EQUIPMENT_FIELD_LENGTH).toBe(255)
    })

    it('accepts a fully specified valid equipment payload', () => {
        const result = equipmentSchema.safeParse(validEquipment)
        expect(result.success).toBe(true)
    })

    it('accepts valid payload with optional fields omitted or empty string', () => {
        const minimalPayload = {
            equipmentName: 'Wireless Lavalier Mic',
            categoryId: 'Audio',
            shortDescription: 'Wireless microphone set',
            modelCode: 'MODEL-1',
            serialNumber: 'SERIAL-1'
        }
        expect(equipmentSchema.safeParse(minimalPayload).success).toBe(true)

        const emptyOptionals = {
            ...minimalPayload,
            technicalSpecs: ''
        }
        expect(equipmentSchema.safeParse(emptyOptionals).success).toBe(true)
    })

    it('requires a model and serial number', () => {
        const result = equipmentSchema.safeParse({ ...validEquipment, modelCode: '', serialNumber: '' })
        expect(result.success).toBe(false)
        expect(result.error.issues.map((issue) => issue.path[0])).toEqual(['modelCode', 'serialNumber'])
    })

    it('rejects an empty or whitespace-only equipment name', () => {
        const emptyResult = equipmentSchema.safeParse({
            ...validEquipment,
            equipmentName: ''
        })
        expect(emptyResult.success).toBe(false)
        expect(emptyResult.error.issues[0].message).toBe('Equipment name is required')

        const whitespaceResult = equipmentSchema.safeParse({
            ...validEquipment,
            equipmentName: '   '
        })
        expect(whitespaceResult.success).toBe(false)
        expect(whitespaceResult.error.issues[0].message).toBe('Equipment name is required')
    })

    it('rejects equipment name exceeding 255 characters', () => {
        const result = equipmentSchema.safeParse({
            ...validEquipment,
            equipmentName: 'A'.repeat(256)
        })
        expect(result.success).toBe(false)
        expect(result.error.issues[0].message).toBe('Must not exceed 255 characters')
    })

    it('rejects an empty category', () => {
        const result = equipmentSchema.safeParse({
            ...validEquipment,
            categoryId: ''
        })
        expect(result.success).toBe(false)
        expect(result.error.issues[0].message).toBe('Please select a category')
    })

    it('rejects category not in EQUIPMENT_CATEGORIES', () => {
        const result = equipmentSchema.safeParse({
            ...validEquipment,
            categoryId: 'NonExistentCategory'
        })
        expect(result.success).toBe(false)
        expect(result.error.issues[0].message).toBe('Please select a category')
    })

    it('rejects an empty or whitespace-only description', () => {
        const result = equipmentSchema.safeParse({
            ...validEquipment,
            shortDescription: '   '
        })
        expect(result.success).toBe(false)
        expect(result.error.issues[0].message).toBe('Description is required')
    })

    it('rejects modelCode exceeding 255 characters', () => {
        const result = equipmentSchema.safeParse({
            ...validEquipment,
            modelCode: 'M'.repeat(256)
        })
        expect(result.success).toBe(false)
        expect(result.error.issues[0].message).toBe('Must not exceed 255 characters')
    })

    it('rejects serialNumber exceeding 255 characters', () => {
        const result = equipmentSchema.safeParse({
            ...validEquipment,
            serialNumber: 'S'.repeat(256)
        })
        expect(result.success).toBe(false)
        expect(result.error.issues[0].message).toBe('Must not exceed 255 characters')
    })

    it('rejects invalid status enum value', () => {
        const result = equipmentSchema.safeParse({
            ...validEquipment,
            status: 'unknown-status'
        })
        expect(result.success).toBe(false)
    })
})
