import { Pool } from "pg";
import { PersonRepository } from "./PersonRepository.js";
import { PersonRecord, CreatePersonDTO, PersonRole } from "../shared/types.js";

export class PGPersonRepository implements PersonRepository {
  constructor(private readonly pool: Pool) {}

  async findById(id: string): Promise<PersonRecord | null> {
    const { rows } = await this.pool.query<PersonRecord>(
      "SELECT * FROM persons WHERE id = $1",
      [id]
    );
    return rows[0] ?? null;
  }

  async findByEmail(email: string): Promise<PersonRecord | null> {
    const { rows } = await this.pool.query<PersonRecord>(
      "SELECT * FROM persons WHERE email = $1",
      [email]
    );
    return rows[0] ?? null;
  }

  async findAll(role?: PersonRole): Promise<PersonRecord[]> {
    if (role) {
      const { rows } = await this.pool.query<PersonRecord>(
        "SELECT * FROM persons WHERE role = $1 ORDER BY created_at DESC",
        [role]
      );
      return rows;
    }
    const { rows } = await this.pool.query<PersonRecord>(
      "SELECT * FROM persons ORDER BY created_at DESC"
    );
    return rows;
  }

  async create(dto: CreatePersonDTO): Promise<PersonRecord> {
    const { rows } = await this.pool.query<PersonRecord>(
      `INSERT INTO persons (name, email, role)
       VALUES ($1, $2, $3) RETURNING *`,
      [dto.name, dto.email, dto.role]
    );
    return rows[0];
  }

  async delete(id: string): Promise<boolean> {
    const { rowCount } = await this.pool.query(
      "DELETE FROM persons WHERE id = $1",
      [id]
    );
    return (rowCount ?? 0) > 0;
  }
}
