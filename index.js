"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Company = exports.FormerName = exports.Address = exports.Filings = exports.File = exports.Recent = void 0;
const typeorm_1 = require("typeorm");
require("reflect-metadata");
let Recent = exports.Recent = class Recent {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], Recent.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Recent.prototype, "accessionNumber", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Recent.prototype, "filingDate", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Recent.prototype, "reportDate", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Recent.prototype, "acceptanceDateTime", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Recent.prototype, "act", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Recent.prototype, "form", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Recent.prototype, "fileNumber", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Recent.prototype, "filmNumber", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Recent.prototype, "items", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Recent.prototype, "size", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Recent.prototype, "isXBRL", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Recent.prototype, "isInlineXBRL", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Recent.prototype, "primaryDocument", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Recent.prototype, "primaryDocDescription", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Filings, (filings) => filings.recent),
    __metadata("design:type", Object)
], Recent.prototype, "filings", void 0);
exports.Recent = Recent = __decorate([
    (0, typeorm_1.Entity)()
], Recent);
let File = exports.File = class File {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], File.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], File.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], File.prototype, "filingCount", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], File.prototype, "filingFrom", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], File.prototype, "filingTo", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Filings, (filings) => filings.files),
    __metadata("design:type", Object)
], File.prototype, "filings", void 0);
exports.File = File = __decorate([
    (0, typeorm_1.Entity)()
], File);
let Filings = exports.Filings = class Filings {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], Filings.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Recent, (recent) => recent.filings, { cascade: true }),
    __metadata("design:type", Object)
], Filings.prototype, "recent", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => File, (file) => file.filings, { cascade: true }),
    __metadata("design:type", Array)
], Filings.prototype, "files", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Company, (company) => company.filings),
    __metadata("design:type", Object)
], Filings.prototype, "company", void 0);
exports.Filings = Filings = __decorate([
    (0, typeorm_1.Entity)()
], Filings);
let Address = exports.Address = class Address {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], Address.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Address.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Address.prototype, "street1", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Address.prototype, "street2", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Address.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Address.prototype, "stateOrCountry", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Address.prototype, "zipCode", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Address.prototype, "stateOrCountryDescription", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Company, (company) => company.addresses),
    __metadata("design:type", Object)
], Address.prototype, "company", void 0);
exports.Address = Address = __decorate([
    (0, typeorm_1.Entity)()
], Address);
let FormerName = exports.FormerName = class FormerName {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], FormerName.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], FormerName.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], FormerName.prototype, "from", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], FormerName.prototype, "to", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Company, (company) => company.formerNames),
    __metadata("design:type", Object)
], FormerName.prototype, "company", void 0);
exports.FormerName = FormerName = __decorate([
    (0, typeorm_1.Entity)()
], FormerName);
let Company = exports.Company = class Company {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Company.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Company.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Company.prototype, "cik", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Company.prototype, "entityType", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Company.prototype, "sic", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Company.prototype, "sicDescription", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Company.prototype, "insiderTransactionForOwnerExists", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Company.prototype, "insiderTransactionForIssuerExists", void 0);
__decorate([
    (0, typeorm_1.Column)("simple-array"),
    __metadata("design:type", Array)
], Company.prototype, "tickers", void 0);
__decorate([
    (0, typeorm_1.Column)("simple-array"),
    __metadata("design:type", Array)
], Company.prototype, "exchanges", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Company.prototype, "ein", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Company.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Company.prototype, "website", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Company.prototype, "investorWebsite", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Company.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Company.prototype, "fiscalYearEnd", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Company.prototype, "stateOfIncorporation", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Company.prototype, "stateOfIncorporationDescription", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Address, (address) => address.company, { cascade: true }),
    __metadata("design:type", Array)
], Company.prototype, "addresses", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Company.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Company.prototype, "flags", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => FormerName, (formerName) => formerName.company, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], Company.prototype, "formerNames", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Filings, (filings) => filings.company, { cascade: true }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", Filings)
], Company.prototype, "filings", void 0);
exports.Company = Company = __decorate([
    (0, typeorm_1.Entity)()
], Company);
