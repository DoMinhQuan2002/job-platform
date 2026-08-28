import { MigrationInterface, QueryRunner } from "typeorm";

/** Catalog demo cho modal Thêm kỹ năng / ngoại ngữ / chứng chỉ. Idempotent. */
const SKILLS: Array<{
  name: string;
  category: "SKILL" | "LANGUAGE" | "CERTIFICATE";
  code: string | null;
  description: string | null;
}> = [
  { name: "JavaScript", category: "SKILL", code: null, description: "Ngôn ngữ lập trình web" },
  { name: "TypeScript", category: "SKILL", code: null, description: null },
  { name: "React", category: "SKILL", code: null, description: null },
  { name: "Next.js", category: "SKILL", code: null, description: null },
  { name: "Node.js", category: "SKILL", code: null, description: null },
  { name: "Java", category: "SKILL", code: null, description: null },
  { name: "Python", category: "SKILL", code: null, description: null },
  { name: "SQL", category: "SKILL", code: null, description: null },
  { name: "Git", category: "SKILL", code: null, description: null },
  { name: "Docker", category: "SKILL", code: null, description: null },
  { name: "REST API", category: "SKILL", code: null, description: null },
  { name: "HTML/CSS", category: "SKILL", code: null, description: null },
  { name: "Tiếng Anh", category: "LANGUAGE", code: "EN", description: null },
  { name: "Tiếng Nhật", category: "LANGUAGE", code: "JP", description: null },
  { name: "Tiếng Trung", category: "LANGUAGE", code: "ZH", description: null },
  { name: "Tiếng Hàn", category: "LANGUAGE", code: "KR", description: null },
  { name: "Tiếng Pháp", category: "LANGUAGE", code: "FR", description: null },
  { name: "Tiếng Đức", category: "LANGUAGE", code: "DE", description: null },
  { name: "IELTS", category: "CERTIFICATE", code: null, description: null },
  { name: "TOEIC", category: "CERTIFICATE", code: null, description: null },
  { name: "TOEFL", category: "CERTIFICATE", code: null, description: null },
  { name: "AWS Cloud Practitioner", category: "CERTIFICATE", code: null, description: null },
  { name: "Google Cloud Associate", category: "CERTIFICATE", code: null, description: null },
  { name: "Scrum Master", category: "CERTIFICATE", code: null, description: null },
];

export class SeedSkillCatalog1787360000000 implements MigrationInterface {
  name = "SeedSkillCatalog1787360000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const skill of SKILLS) {
      await queryRunner.query(
        `INSERT INTO "skills" ("name", "category", "code", "description", "status")
         SELECT $1::varchar, $2::varchar, $3::varchar, $4::text, 'ACTIVE'
         WHERE NOT EXISTS (
           SELECT 1 FROM "skills"
           WHERE "category" = $2::varchar AND LOWER("name") = LOWER($1::varchar)
         )`,
        [skill.name, skill.category, skill.code, skill.description],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const names = SKILLS.map((skill) => skill.name);
    await queryRunner.query(
      `DELETE FROM "skills" s
       WHERE LOWER(s."name") = ANY($1::text[])
         AND NOT EXISTS (SELECT 1 FROM "candidate_skills" cs WHERE cs."skill_id" = s."id")
         AND NOT EXISTS (SELECT 1 FROM "job_skills" js WHERE js."skill_id" = s."id")`,
      [names.map((name) => name.toLowerCase())],
    );
  }
}
