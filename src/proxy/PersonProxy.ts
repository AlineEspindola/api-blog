import { PersonRepository } from "../repository/PersonRepository.js";
import { Author } from "../user/Author.js";
import { Reader } from "../user/Reader.js";
import { Person } from "../user/Person.js";
import { DefaultText } from "../text/DefaultText.js";
import { Email } from "../text/Email.js";
import { PersonRecord, CreatePersonDTO, PersonRole } from "../shared/types.js";

/**
 * PersonProxy — Padrão Proxy
 *
 * Traduz PersonRecord (plano) → Author | Reader (domínio),
 * mantendo o id separado das classes originais.
 */

export interface PersonWithId {
  id:     string;
  person: Person;
  role:   PersonRole;
  name:   string;
  email:  string;
}

export class PersonProxy {
  constructor(private readonly repository: PersonRepository) {}

  async getById(id: string): Promise<PersonWithId | null> {
    const record = await this.repository.findById(id);
    if (!record) return null;
    return this.toPersonWithId(record);
  }

  async getByEmail(email: string): Promise<PersonWithId | null> {
    const record = await this.repository.findByEmail(email);
    if (!record) return null;
    return this.toPersonWithId(record);
  }

  async getAll(role?: PersonRole): Promise<PersonWithId[]> {
    const records = await this.repository.findAll(role);
    return records.map((r) => this.toPersonWithId(r));
  }

  async create(dto: CreatePersonDTO): Promise<PersonWithId> {
    // valida email via classe de domínio antes de persistir
    new Email(new DefaultText(dto.email)).getValue();

    const existing = await this.repository.findByEmail(dto.email);
    if (existing) throw new Error("Email já cadastrado.");

    const record = await this.repository.create(dto);
    return this.toPersonWithId(record);
  }

  async delete(id: string): Promise<boolean> {
    return this.repository.delete(id);
  }

  private toPersonWithId(record: PersonRecord): PersonWithId {
    const name  = new DefaultText(record.name);
    const email = new Email(new DefaultText(record.email));

    const person: Person =
      record.role === "author"
        ? new Author(name, email)
        : new Reader(name, email);

    return {
      id:     record.id,
      person,
      role:   record.role,
      name:   record.name,
      email:  record.email,
    };
  }
}
