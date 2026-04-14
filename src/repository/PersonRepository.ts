import {
  PersonRecord,
  CreatePersonDTO,
  PersonRole,
} from "../shared/types.js";

export interface PersonRepository {
  findById(id: string): Promise<PersonRecord | null>;
  findByEmail(email: string): Promise<PersonRecord | null>;
  findAll(role?: PersonRole): Promise<PersonRecord[]>;
  create(dto: CreatePersonDTO): Promise<PersonRecord>;
  delete(id: string): Promise<boolean>;
}
