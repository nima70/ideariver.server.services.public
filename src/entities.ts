import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  OneToOne,
  JoinColumn,
  Relation,
} from "typeorm";
import {
  IRecent,
  IFile,
  IAddress,
  IFormerName,
  IFilings,
  ICompany,
} from "ideariver.core";
import "reflect-metadata";

@Entity()
export class Recent implements IRecent {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  accessionNumber!: string;

  @Column()
  filingDate!: string;

  @Column()
  reportDate!: string;

  @Column()
  acceptanceDateTime!: string;

  @Column()
  act!: string;

  @Column()
  form!: string;

  @Column()
  fileNumber!: string;

  @Column()
  filmNumber!: string;

  @Column()
  items!: string;

  @Column()
  size!: number;

  @Column()
  isXBRL!: number;

  @Column()
  isInlineXBRL!: number;

  @Column()
  primaryDocument!: string;

  @Column()
  primaryDocDescription!: string;

  @ManyToOne(() => Filings, (filings) => filings.recent)
  filings!: Relation<Filings>;
}

@Entity()
export class File implements IFile {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column()
  filingCount!: number;

  @Column()
  filingFrom!: string;

  @Column()
  filingTo!: string;

  @ManyToOne(() => Filings, (filings) => filings.files)
  filings!: Relation<Filings>;
}

@Entity()
export class Filings implements IFilings {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @OneToMany(() => Recent, (recent) => recent.filings, { cascade: true })
  recent!: Recent[];

  @OneToMany(() => File, (file) => file.filings, { cascade: true })
  files!: File[];

  @OneToOne(() => Company, (company) => company.filings)
  company!: Relation<Company>;
}

@Entity()
export class Address implements IAddress {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  type!: string;

  @Column()
  street1!: string;

  @Column({ nullable: true })
  street2?: string;

  @Column()
  city!: string;

  @Column()
  stateOrCountry!: string;

  @Column()
  zipCode!: string;

  @Column()
  stateOrCountryDescription!: string;

  @ManyToOne(() => Company, (company) => company.addresses)
  company!: Relation<Company>;
}

@Entity()
export class FormerName implements IFormerName {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column()
  from!: string;

  @Column()
  to!: string;

  @ManyToOne(() => Company, (company) => company.formerNames)
  company!: Relation<Company>;
}

@Entity()
export class Company implements ICompany {
  @PrimaryGeneratedColumn()
  id!: string;

  @Column()
  name!: string;

  @Column()
  cik!: string;

  @Column()
  entityType!: string;

  @Column()
  sic!: string;

  @Column()
  sicDescription!: string;

  @Column()
  insiderTransactionForOwnerExists!: number;

  @Column()
  insiderTransactionForIssuerExists!: number;

  @Column("simple-array")
  tickers!: string[];

  @Column("simple-array")
  exchanges!: string[];

  @Column()
  ein!: string;

  @Column()
  description!: string;

  @Column()
  website!: string;

  @Column()
  investorWebsite!: string;

  @Column()
  category!: string;

  @Column()
  fiscalYearEnd!: string;

  @Column()
  stateOfIncorporation!: string;

  @Column()
  stateOfIncorporationDescription!: string;

  @OneToMany(() => Address, (address) => address.company, { cascade: true })
  addresses!: Address[];

  @Column()
  phone!: string;

  @Column()
  flags!: string;

  @OneToMany(() => FormerName, (formerName) => formerName.company, {
    cascade: true,
  })
  formerNames!: FormerName[];

  @OneToOne(() => Filings, (filings) => filings.company, { cascade: true })
  @JoinColumn()
  filings!: Filings;
}
