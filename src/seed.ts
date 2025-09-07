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
      await manager.query('DELETE FROM project_skills');
      await manager.query('DELETE FROM project_categories');
      await manager.query('DELETE FROM application_skills'); // Clear application-skills junction table
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

      // 10 Users
      const usersData = Array.from({ length: 10 }).map((_, i) => ({
        firstName: `User${i + 1}`,
        lastName: `Lastname${i + 1}`,
        loginEmail: `user${i + 1}@example.com`,
        password: hashedPassword,
        role: i === 0 ? UserRole.ADMIN : UserRole.USER,
        skills: skills.slice(i % 10, (i % 10) + 3).map(s => s.name),
        yearOfBirth: 1980 + i,
        zipCode: 10000 + i,
        city: `City${i + 1}`,
        state: `State${i + 1}`,
        isActivated: true,
        isDisabled: false,
      }));
      const users = await userRepository.save(usersData.map(u => userRepository.create(u)));

      // 10 NGOs
      const ngosData = Array.from({ length: 10 }).map((_, i) => ({
        name: `NGO ${i + 1}`,
        isNonProfit: true,
        industry: [categories[i % 10].name],
        streetAndNumber: `Street ${i + 1}`,
        zipCode: 10000 + i,
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
        description: `Description for project ${i + 1}`,
        images: [`project${i + 1}_img1.jpg`],
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

      // Assign participants
      projects.forEach((project, i) => {
        project.participants = [users[i]];
      });
      await Promise.all(projects.map(p => projectRepository.save(p)));

      // 10 Applications with Skills
      const applicationsData = projects.map((project, i) => {
        // Create application with basic data
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

        // Add skills to each application (1-3 skills from the project's required skills)
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

      // Save applications and their skills
      for (const appData of applicationsData) {
        const { skills: appSkills, ...applicationWithoutSkills } = appData;
        const application = applicationRepository.create(applicationWithoutSkills);
        application.skills = appSkills;
        await applicationRepository.save(application);
      }

      console.log('Seeding completed successfully!');
      console.log(`✅ Created ${skills.length} skills`);
      console.log(`✅ Created ${categories.length} categories`);
      console.log(`✅ Created ${users.length} users`);
      console.log(`✅ Created ${ngos.length} NGOs`);
      console.log(`✅ Created ${projects.length} projects`);
      console.log(`✅ Created ${applicationsData.length} applications with skills`);
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
