import { AppDataSource } from './app';
import { User } from './models/userModel';
import { Ngo } from './models/ngoModel';
import { Skill } from './models/skillModel';
import { Category } from './models/categoryModel';
import { Application } from './models/applicationModel';
import { Project } from './models/projectModel';
import { UserRole } from './types/userRole';
import { ApplicationStatus } from './types/applicationRole';
import * as bcrypt from 'bcrypt';

const seedData = async () => {
  try {
    await AppDataSource.initialize();
    console.log('Database connected for seeding...');

    await AppDataSource.transaction(async manager => {
      const userRepository = manager.getRepository(User);
      const ngoRepository = manager.getRepository(Ngo);
      const skillRepository = manager.getRepository(Skill);
      const categoryRepository = manager.getRepository(Category);
      const projectRepository = manager.getRepository(Project);
      const applicationRepository = manager.getRepository(Application);

      console.log('Clearing existing data...');
      await applicationRepository.clear();
      await manager.query('DELETE FROM user_projects');
      await manager.query('DELETE FROM user_skills'); // Clear user-skills junction table
      await manager.query('DELETE FROM project_skills');
      await manager.query('DELETE FROM project_categories');
      await manager.query('DELETE FROM application_skills');
      await projectRepository.clear();
      await userRepository.clear();
      await ngoRepository.clear();
      await skillRepository.clear();
      await categoryRepository.clear();

      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash('password123', saltRounds);

      // 10 Skills
      const skillsData = [
        { name: 'Web Development', description: 'Frontend and backend development' },
        { name: 'Graphic Design', description: 'Visual and branding design' },
        { name: 'Project Management', description: 'Managing teams and projects' },
        { name: 'Marketing', description: 'Digital and traditional marketing' },
        { name: 'Teaching', description: 'Educational skills' },
        { name: 'Social Media', description: 'Social media management' },
        { name: 'Photography', description: 'Photography and editing' },
        { name: 'Translation', description: 'Language translation' },
        { name: 'Event Planning', description: 'Organizing events' },
        { name: 'Fundraising', description: 'Raising funds for causes' },
      ];
      const skills = await skillRepository.save(skillsData.map(s => skillRepository.create(s)));

      // 10 Categories
      const categoriesData = [
        { name: 'Education' },
        { name: 'Healthcare' },
        { name: 'Environment' },
        { name: 'Social Services' },
        { name: 'Arts & Culture' },
        { name: 'Sports' },
        { name: 'Technology' },
        { name: 'Community' },
        { name: 'Animal Welfare' },
        { name: 'Human Rights' },
      ];
      const categories = await categoryRepository.save(
        categoriesData.map(c => categoryRepository.create(c))
      );

      // 10 Users with proper skill relationships
      const usersData = Array.from({ length: 10 }).map((_, i) => ({
        firstName: `User${i + 1}`,
        lastName: `Lastname${i + 1}`,
        loginEmail: `user${i + 1}@example.com`,
        password: hashedPassword,
        image: 'http://localhost:3333/uploads/users/588434aa-41b2-4319-9d2f-c72ca1c8d0ee.png',
        role: i === 0 ? UserRole.ADMIN : UserRole.USER,
        yearOfBirth: 1980 + i,
        zipCode: 10000 + i,
        city: `City${i + 1}`,
        state: `State${i + 1}`,
        isActivated: true,
        isDisabled: false,
      }));

      const users = await userRepository.save(usersData.map(u => userRepository.create(u)));

      // Assign skills to users (proper many-to-many relationships)
      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        const userSkills = skills.slice(i % 10, (i % 10) + 3); // Each user gets 3 skills
        user.skills = userSkills;
        await userRepository.save(user);
      }

      // 10 NGOs
      const ngosData = Array.from({ length: 10 }).map((_, i) => ({
        name: `NGO ${i + 1}`,
        isNonProfit: true,
        industry: [categories[i % 10].name],
        streetAndNumber: `Street ${i + 1}`,
        zipCode: 10000 + i,
        image: 'http://localhost:3333/uploads/ngos/bd3f08bd-a642-4b77-becf-4f4dbdea6e1a.png',
        city: `City${i + 1}`,
        state: `State${i + 1}`,
        principal: `Principal ${i + 1}`,
        loginEmail: `ngo${i + 1}@example.com`,
        password: hashedPassword,
        phone: `+49151000000${i}`,
        isActivated: true,
        isDisabled: false,
      }));
      const ngos = await ngoRepository.save(ngosData.map(n => ngoRepository.create(n)));

      // 10 Projects
      const projectsData = Array.from({ length: 10 }).map((_, i) => ({
        name: `Project ${i + 1}`,
        description: `Description for project ${i + 1}. This is a detailed description that explains what this project is about and what volunteers will be doing. It contains at least 50 characters to meet validation requirements.`,
        images: [
          'http://localhost:3333/uploads/projects/71bb6806-2568-4734-9022-9509adb0ec27.png',
          'http://localhost:3333/uploads/projects/18055f58-7241-43f7-9469-80592cceb096.png',
          'http://localhost:3333/uploads/projects/860032a2-1d09-496d-892c-63a8b4364fe3.png',
        ],
        categories: [categories[i % 10]],
        ngoId: ngos[i % 10].id,
        ngo: ngos[i % 10],
        city: `City${i + 1}`,
        zipCode: 10000 + i,
        state: `State${i + 1}`,
        principal: `Principal ${i + 1}`,
        compensation: `${100 * (i + 1)}€`,
        isActive: i % 2 === 0,
        skills: [skills[i % 10], skills[(i + 1) % 10]],
        startingAt: new Date(),
        endingAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      }));
      const projects = await projectRepository.save(
        projectsData.map(p => projectRepository.create(p))
      );

      // Assign participants to projects
      for (let i = 0; i < projects.length; i++) {
        const project = projects[i];
        project.participants = [users[i]];
        await projectRepository.save(project);
      }

      // 10 Applications with Skills
      const applicationsData = projects.map((project, i) => {
        const applicationData = {
          projectId: project.id,
          userId: users[i].id,
          ngoId: ngos[i].id,
          status:
            i % 3 === 0
              ? ApplicationStatus.ACCEPTED
              : i % 3 === 1
                ? ApplicationStatus.PENDING
                : ApplicationStatus.REJECTED,
          message: `Application message for ${project.name}`,
        };

        const projectSkills = project.skills || [];
        const numSkillsToAdd = Math.min(
          projectSkills.length,
          Math.max(1, Math.floor(Math.random() * 3) + 1)
        );
        const applicationSkills = projectSkills.slice(0, numSkillsToAdd);

        return {
          ...applicationData,
          skills: applicationSkills,
        };
      });

      // Save applications with their skills
      for (const appData of applicationsData) {
        const { skills: appSkills, ...applicationWithoutSkills } = appData;
        const application = applicationRepository.create(applicationWithoutSkills);
        application.skills = appSkills;
        await applicationRepository.save(application);
      }

      console.log('Seeding completed successfully!');
      console.log(`✅ Created ${skills.length} skills`);
      console.log(`✅ Created ${categories.length} categories`);
      console.log(`✅ Created ${users.length} users with skills`);
      console.log(`✅ Created ${ngos.length} NGOs`);
      console.log(`✅ Created ${projects.length} projects`);
      console.log(`✅ Created ${applicationsData.length} applications with skills`);

      // Log some sample data to verify relationships
      const sampleUser = await userRepository.findOne({
        where: { id: users[0].id },
        relations: ['skills'],
      });
      console.log(
        `👤 Sample user ${sampleUser?.firstName} has ${sampleUser?.skills?.length} skills:`,
        sampleUser?.skills?.map(s => s.name)
      );
    });
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await AppDataSource.destroy();
    console.log('Database connection closed.');
  }
};

if (require.main === module) {
  seedData();
}

export default seedData;
