import { AppDataSource } from './app';
import { User } from './models/userModel';
import { Ngo } from './models/ngoModel';
import { Skill } from './models/skillModel';
import { Category } from './models/categoryModel';
import { Application } from './models/applicationModel';
import { Project } from './models/projectModel';
import { Notification } from './models/notificationModel'; // ⬅️ NEU: Notification-Entity
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
      const notificationRepository = manager.getRepository(Notification); // ⬅️ NEU

      console.log('Clearing existing data...');
      await applicationRepository.clear();
      await manager.query('DELETE FROM user_projects');
      await manager.query('DELETE FROM user_skills');
      await manager.query('DELETE FROM project_skills');
      await manager.query('DELETE FROM project_categories');
      await manager.query('DELETE FROM application_skills');
      await notificationRepository.clear(); // ⬅️ NEU: Notifications leeren
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
      const skills = await skillRepository.save(
        skillsData.map(skillItem => skillRepository.create(skillItem))
      );

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
        categoriesData.map(categoryItem => categoryRepository.create(categoryItem))
      );

      // 10 Users with proper skill relationships
      const usersData = Array.from({ length: 10 }).map((unused, index) => ({
        firstName: `User${index + 1}`,
        lastName: `Lastname${index + 1}`,
        loginEmail: `user${index + 1}@example.com`,
        password: hashedPassword,
        image: 'http://localhost:3333/uploads/users/588434aa-41b2-4319-9d2f-c72ca1c8d0ee.png',
        role: index === 0 ? UserRole.ADMIN : UserRole.USER,
        yearOfBirth: 1980 + index,
        zipCode: 10000 + index,
        city: `City${index + 1}`,
        state: `State${index + 1}`,
        isActivated: true,
        isDisabled: false,
      }));

      const users = await userRepository.save(
        usersData.map(userItem => userRepository.create(userItem))
      );

      // Assign skills to users (proper many-to-many relationships)
      for (let index = 0; index < users.length; index++) {
        const user = users[index];
        const userSkills = skills.slice(index % 10, (index % 10) + 3); // Each user gets 3 skills
        user.skills = userSkills;
        await userRepository.save(user);
      }

      // 10 NGOs
      const ngosData = Array.from({ length: 10 }).map((unused, index) => ({
        name: `NGO ${index + 1}`,
        isNonProfit: true,
        industry: [categories[index % 10].name],
        streetAndNumber: `Street ${index + 1}`,
        zipCode: 10000 + index,
        image: 'http://localhost:3333/uploads/ngos/bd3f08bd-a642-4b77-becf-4f4dbdea6e1a.png',
        city: `City${index + 1}`,
        state: `State${index + 1}`,
        principal: `Principal ${index + 1}`,
        loginEmail: `ngo${index + 1}@example.com`,
        password: hashedPassword,
        phone: `+49151000000${index}`,
        isActivated: true,
        isDisabled: false,
      }));
      const ngos = await ngoRepository.save(ngosData.map(ngoItem => ngoRepository.create(ngoItem)));

      // 10 Projects
      const projectsData = Array.from({ length: 10 }).map((unused, index) => ({
        name: `Project ${index + 1}`,
        description: `Description for project ${index + 1}. This is a detailed description that explains what this project is about and what volunteers will be doing. It contains at least 50 characters to meet validation requirements.`,
        images: [
          'http://localhost:3333/uploads/projects/71bb6806-2568-4734-9022-9509adb0ec27.png',
          'http://localhost:3333/uploads/projects/18055f58-7241-43f7-9469-80592cceb096.png',
          'http://localhost:3333/uploads/projects/860032a2-1d09-496d-892c-63a8b4364fe3.png',
        ],
        categories: [categories[index % 10]],
        ngoId: ngos[index % 10].id,
        ngo: ngos[index % 10],
        city: `City${index + 1}`,
        zipCode: 10000 + index,
        state: `State${index + 1}`,
        principal: `Principal ${index + 1}`,
        compensation: `${100 * (index + 1)}€`,
        isActive: index % 2 === 0,
        skills: [skills[index % 10], skills[(index + 1) % 10]],
        startingAt: new Date(),
        endingAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      }));
      const projects = await projectRepository.save(
        projectsData.map(projectItem => projectRepository.create(projectItem))
      );

      // Assign participants to projects
      for (let index = 0; index < projects.length; index++) {
        const project = projects[index];
        project.participants = [users[index]];
        await projectRepository.save(project);
      }

      // 10 Applications with Skills
      const applicationsData = projects.map((projectItem, index) => {
        const applicationData = {
          projectId: projectItem.id,
          userId: users[index].id,
          ngoId: ngos[index].id,
          status:
            index % 3 === 0
              ? ApplicationStatus.ACCEPTED
              : index % 3 === 1
                ? ApplicationStatus.PENDING
                : ApplicationStatus.REJECTED,
          message: `Application message for ${projectItem.name}`,
        };

        const projectSkills = projectItem.skills || [];
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

      // Save applications with their skills and keep references
      const savedApplications: Application[] = [];
      for (const applicationData of applicationsData) {
        const { skills: applicationSkills, ...applicationWithoutSkills } = applicationData;
        const applicationEntity = applicationRepository.create(applicationWithoutSkills);
        applicationEntity.skills = applicationSkills;
        const savedApplication = await applicationRepository.save(applicationEntity);
        savedApplications.push(savedApplication);
      }

      // === Notifications generieren (mehrere pro Example NGO und Example User) ===
      // Example User = erster "normaler" User (Index 1), Example NGO = erste NGO (Index 0)
      const exampleUser = users[1];
      const exampleNgo = ngos[0];

      // Anwendungen mit Relationen nachladen, damit Texte wie im Controller gebaut werden können
      const applicationsWithRelations: Array<
        Application & { user?: User; project?: Project; ngo?: Ngo }
      > = [];
      for (const applicationItem of savedApplications) {
        const fullApplication = await applicationRepository.findOne({
          where: { id: applicationItem.id },
          relations: ['user', 'project', 'ngo'],
        });
        if (fullApplication) applicationsWithRelations.push(fullApplication);
      }

      // 1) NGO-Notifications: USER_APPLIED (entspricht createApplication → NGO informieren)
      const ngoNotificationsToCreate: Notification[] = [];
      for (const applicationItem of applicationsWithRelations) {
        if (
          applicationItem.ngoId === exampleNgo.id &&
          applicationItem.user &&
          applicationItem.project
        ) {
          const notificationForNgo = notificationRepository.create({
            ngoId: exampleNgo.id,
            name: `${applicationItem.user.firstName} ${applicationItem.user.lastName} hat sich beworben`,
            description: `${applicationItem.user.firstName} ${applicationItem.user.lastName} hat sich für „${applicationItem.project.name}” beworben.`,
            read: false,
          });
          ngoNotificationsToCreate.push(notificationForNgo);
        }
      }

      // Falls zu wenige vorhanden sind (z. B. 1), fülle auf mindestens 2 Bewerbungs-Notifications auf
      if (ngoNotificationsToCreate.length < 2) {
        const projectForExampleNgo =
          projects.find(projectItem => projectItem.ngoId === exampleNgo.id) || projects[0];
        const extraUserA = users[2];
        const extraUserB = users[3];
        if (projectForExampleNgo && extraUserA) {
          ngoNotificationsToCreate.push(
            notificationRepository.create({
              ngoId: exampleNgo.id,
              name: `${extraUserA.firstName} ${extraUserA.lastName} hat sich beworben`,
              description: `${extraUserA.firstName} ${extraUserA.lastName} hat sich für „${projectForExampleNgo.name}” beworben.`,
              read: false,
            })
          );
        }
        if (projectForExampleNgo && extraUserB) {
          ngoNotificationsToCreate.push(
            notificationRepository.create({
              ngoId: exampleNgo.id,
              name: `${extraUserB.firstName} ${extraUserB.lastName} hat sich beworben`,
              description: `${extraUserB.firstName} ${extraUserB.lastName} hat sich für „${projectForExampleNgo.name}” beworben.`,
              read: false,
            })
          );
        }
      }

      await notificationRepository.save(ngoNotificationsToCreate);

      // 2) User-Notifications: NGO_ACCEPTED/NGO_REJECTED (entspricht updateApplicationStatus → User informieren)
      const userNotificationsToCreate: Notification[] = [];
      for (const applicationItem of applicationsWithRelations) {
        if (applicationItem.userId === exampleUser.id && applicationItem.project) {
          if (applicationItem.status === ApplicationStatus.ACCEPTED) {
            userNotificationsToCreate.push(
              notificationRepository.create({
                userId: exampleUser.id,
                name: 'Bewerbung angenommen',
                description: `Deine Bewerbung für „${applicationItem.project.name}” wurde akzeptiert.`,
                read: false,
              })
            );
          } else if (applicationItem.status === ApplicationStatus.REJECTED) {
            userNotificationsToCreate.push(
              notificationRepository.create({
                userId: exampleUser.id,
                name: 'Bewerbung abgelehnt',
                description: `Deine Bewerbung für „${applicationItem.project.name}” wurde abgelehnt.`,
                read: false,
              })
            );
          }
        }
      }

      // Falls der Example User weniger als 2 Status-Notifications hat, füge Dummy-Statusmeldungen hinzu
      if (userNotificationsToCreate.length < 2) {
        const fallbackProject = projects[1] || projects[0];
        userNotificationsToCreate.push(
          notificationRepository.create({
            userId: exampleUser.id,
            name: 'Bewerbung angenommen',
            description: `Deine Bewerbung für „${fallbackProject.name}” wurde akzeptiert.`,
            read: false,
          })
        );
        userNotificationsToCreate.push(
          notificationRepository.create({
            userId: exampleUser.id,
            name: 'Bewerbung abgelehnt',
            description: `Deine Bewerbung für „${fallbackProject.name}” wurde abgelehnt.`,
            read: false,
          })
        );
      }

      await notificationRepository.save(userNotificationsToCreate);

      // 3) Optional: Eine Withdraw-Notification für die Example NGO (entspricht deleteApplicationById → NGO informieren)
      const projectForWithdraw = projects.find(projectItem => projectItem.ngoId === exampleNgo.id);
      if (projectForWithdraw) {
        const withdrawNotification = notificationRepository.create({
          ngoId: exampleNgo.id,
          name: 'Bewerbung zurückgezogen',
          description: 'Der Nutzer hat seine Bewerbung zurückgezogen.',
          read: false,
        });
        await notificationRepository.save(withdrawNotification);
      }

      console.log('Seeding completed successfully!');
      console.log(`✅ Created ${skills.length} skills`);
      console.log(`✅ Created ${categories.length} categories`);
      console.log(`✅ Created ${users.length} users with skills`);
      console.log(`✅ Created ${ngos.length} NGOs`);
      console.log(`✅ Created ${projects.length} projects`);
      console.log(`✅ Created ${savedApplications.length} applications with skills`);
      console.log(`✅ Created ${ngoNotificationsToCreate.length} NGO notifications (USER_APPLIED)`);
      console.log(
        `✅ Created ${userNotificationsToCreate.length} user notifications (ACCEPTED/REJECTED)`
      );
      console.log(`✅ Created 1 NGO withdraw notification`);

      // Sample check, unchanged
      const sampleUser = await userRepository.findOne({
        where: { id: users[0].id },
        relations: ['skills'],
      });
      console.log(
        `👤 Sample user ${sampleUser?.firstName} has ${sampleUser?.skills?.length} skills:`,
        sampleUser?.skills?.map(skillItem => skillItem.name)
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
