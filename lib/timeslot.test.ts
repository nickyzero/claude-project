import { describe, it, expect } from 'vitest'
import { getTimeSlot } from './timeslot'

describe('getTimeSlot', () => {
  it('returns morning for hour 7', () => expect(getTimeSlot(7)).toBe('morning'))
  it('returns afternoon for hour 14', () => expect(getTimeSlot(14)).toBe('afternoon'))
  it('returns evening for hour 20', () => expect(getTimeSlot(20)).toBe('evening'))
  it('returns dawn for hour 3', () => expect(getTimeSlot(3)).toBe('dawn'))
  it('returns morning at boundary 6', () => expect(getTimeSlot(6)).toBe('morning'))
  it('returns afternoon at boundary 12', () => expect(getTimeSlot(12)).toBe('afternoon'))
  it('returns evening at boundary 18', () => expect(getTimeSlot(18)).toBe('evening'))
  it('returns dawn at boundary 0', () => expect(getTimeSlot(0)).toBe('dawn'))
  it('returns dawn for hour 5', () => expect(getTimeSlot(5)).toBe('dawn'))
})
