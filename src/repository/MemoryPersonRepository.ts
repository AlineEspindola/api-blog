import { randomUUID } from "crypto";
import { PersonRepository } from "./PersonRepository.js";
import { PersonRecord, CreatePersonDTO, PersonRole } from "../shared/types.js";

export class MemoryPersonRepository implements PersonRepository {
  private persons: Map<string, PersonRecord> = new Map();

  async findById(id: string): Promise<PersonRecord | null> {
    return this.persons.get(id) ?? null;
  }

  async findByEmail(email: string): Promise<PersonRecord | null> {
    return [...this.persons.values()].find((p) => p.email === email) ?? null;
  }

  async findAll(role?: PersonRole): Promise<PersonRecord[]> {
    const all = [...this.persons.values()];
    return role ? all.filter((p) => p.role === role) : all;
  }

  async create(dto: CreatePersonDTO): Promise<PersonRecord> {
    const record: PersonRecord = {
      id:         randomUUID(),
      name:       dto.name,
      email:      dto.email,
      role:       dto.role,
      created_at: new Date(),
    };
    this.persons.set(record.id, record);
    return record;
  }

  async delete(id: string): Promise<boolean> {
    return this.persons.delete(id);
  }
}
