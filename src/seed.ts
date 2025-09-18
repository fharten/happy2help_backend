import { AppDataSource } from './app';
import { User } from './models/userModel';
import { Ngo } from './models/ngoModel';
import { Skill } from './models/skillModel';
import { Category } from './models/categoryModel';
import { Application } from './models/applicationModel';
import { Project } from './models/projectModel';
import { Notification } from './models/notificationModel'; // <— NEU: Notification-Entity
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
      const notificationRepository = manager.getRepository(Notification); // <— NEU

      console.log('Clearing existing data...');
      await applicationRepository.clear();
      await manager.query('DELETE FROM user_projects');
      await manager.query('DELETE FROM project_skills');
      await manager.query('DELETE FROM project_categories');
      await manager.query('DELETE FROM application_skills');
      await notificationRepository.clear(); // <— NEU: Notifications leeren
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

      // 10 Users
      const usersData = Array.from({ length: 10 }).map((unused, index) => ({
        firstName: `User${index + 1}`,
        lastName: `Lastname${index + 1}`,
        loginEmail: `user${index + 1}@example.com`,
        password: hashedPassword,
        role: index === 0 ? UserRole.ADMIN : UserRole.USER,
        skills: skills.slice(index % 10, (index % 10) + 3).map(skillItem => skillItem.name),
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

      // 10 NGOs
      const ngosData = Array.from({ length: 10 }).map((unused, index) => ({
        name: `NGO ${index + 1}`,
        isNonProfit: true,
        industry: [categories[index % 10].name],
        streetAndNumber: `Street ${index + 1}`,
        zipCode: 10000 + index,
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
        description: `Description for project ${index + 1}`,
        images: [`project${index + 1}_img1.jpg`],
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

      // Assign participants
      projects.forEach((projectItem, index) => {
        projectItem.participants = [users[index]];
      });
      await Promise.all(projects.map(projectItem => projectRepository.save(projectItem)));

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
        const numberOfSkillsToAdd = Math.min(
          projectSkills.length,
          Math.max(1, Math.floor(Math.random() * 3) + 1)
        );
        const applicationSkills = projectSkills.slice(0, numberOfSkillsToAdd);

        return {
          ...applicationData,
          skills: applicationSkills,
        };
      });

      // Save applications and collect references for notifications
      const savedApplications: Application[] = [];
      for (const applicationDatum of applicationsData) {
        const { skills: applicationSkills, ...applicationWithoutSkills } = applicationDatum;
        const applicationEntity = applicationRepository.create(applicationWithoutSkills);
        applicationEntity.skills = applicationSkills;
        const savedApplication = await applicationRepository.save(applicationEntity);
        savedApplications.push(savedApplication);
      }

      // === Notifications erzeugen (auf Basis ApplicationController-Logik) ===
      // Definition "Example User" = erster normaler User (users[1]), "Example NGO" = ngos[0]
      const exampleUser = users[1]; // users[0] ist Admin
      const exampleNgo = ngos[0];

      // Hilfsfunktionen für Texte
      const makeAppliedName = (userEntity: User) =>
        `${userEntity.firstName} ${userEntity.lastName} hat sich beworben`;
      const makeAppliedDescription = (userEntity: User, projectEntity: Project) =>
        `${userEntity.firstName} ${userEntity.lastName} hat sich für „${projectEntity.name}” beworben.`;

      const makeAcceptedName = () => 'Bewerbung angenommen';
      const makeAcceptedDescription = (projectEntity: Project) =>
        `Deine Bewerbung für „${projectEntity.name}” wurde akzeptiert.`;

      const makeRejectedName = () => 'Bewerbung abgelehnt';
      const makeRejectedDescription = (projectEntity: Project) =>
        `Deine Bewerbung für „${projectEntity.name}” wurde abgelehnt.`;

      // Lade vollständige Relationen für die erzeugten Applications (User/Project/Ngo),
      // damit wir Texte wie im Controller generieren können.
      const applicationsWithRelations: Array<
        Application & { user?: User; project?: Project; ngo?: Ngo }
      > = [];
      for (const applicationItem of savedApplications) {
        const full = await applicationRepository.findOne({
          where: { id: applicationItem.id },
          relations: ['user', 'project', 'ngo'],
        });
        if (full) applicationsWithRelations.push(full);
      }

      // 1) NGO-Notifications (USER_APPLIED) – für Bewerbungen, die zur Example NGO gehören
      //    (entspricht createApplication -> notify NGO)
      const ngoAppliedNotifications = [];
      for (const applicationItem of applicationsWithRelations) {
        if (
          applicationItem.ngoId === exampleNgo.id &&
          applicationItem.user &&
          applicationItem.project
        ) {
          const notification = notificationRepository.create({
            ngoId: exampleNgo.id,
            name: makeAppliedName(applicationItem.user),
            description: makeAppliedDescription(applicationItem.user, applicationItem.project),
            read: false,
          });
          ngoAppliedNotifications.push(notification);
        }
      }

      // Falls die Example NGO zu wenige Bewerbungen hat (z. B. nur 1 Projekt),
      // fügen wir manuell noch 2 Bewerbungs-Notifications hinzu (andere User auf das gleiche Projekt).
      if (ngoAppliedNotifications.length < 2) {
        const projectForExampleNgo = projects.find(
          projectItem => projectItem.ngoId === exampleNgo.id
        );
        if (projectForExampleNgo) {
          const extraUserA = users[2];
          const extraUserB = users[3];
          if (extraUserA) {
            ngoAppliedNotifications.push(
              notificationRepository.create({
                ngoId: exampleNgo.id,
                name: makeAppliedName(extraUserA),
                description: makeAppliedDescription(extraUserA, projectForExampleNgo),
                read: false,
              })
            );
          }
          if (extraUserB) {
            ngoAppliedNotifications.push(
              notificationRepository.create({
                ngoId: exampleNgo.id,
                name: makeAppliedName(extraUserB),
                description: makeAppliedDescription(extraUserB, projectForExampleNgo),
                read: false,
              })
            );
          }
        }
      }

      await notificationRepository.save(ngoAppliedNotifications);

      // 2) User-Notifications (NGO_ACCEPTED / NGO_REJECTED) – für Bewerbungen des Example Users
      //    (entspricht updateApplicationStatus -> notify User)
      const userStatusNotifications = [];
      for (const applicationItem of applicationsWithRelations) {
        if (applicationItem.userId === exampleUser.id && applicationItem.project) {
          if (applicationItem.status === ApplicationStatus.ACCEPTED) {
            userStatusNotifications.push(
              notificationRepository.create({
                userId: exampleUser.id,
                name: makeAcceptedName(),
                description: makeAcceptedDescription(applicationItem.project),
                read: false,
              })
            );
          } else if (applicationItem.status === ApplicationStatus.REJECTED) {
            userStatusNotifications.push(
              notificationRepository.create({
                userId: exampleUser.id,
                name: makeRejectedName(),
                description: makeRejectedDescription(applicationItem.project),
                read: false,
              })
            );
          }
        }
      }

      // Falls der Example User zufällig keine akzeptierten/abgelehnten Bewerbungen hat,
      // erzeugen wir ihm exemplarisch zwei gemischte Status-Notifications auf einem Projekt.
      if (userStatusNotifications.length < 2) {
        const fallbackProject = projects[1] || projects[0];
        userStatusNotifications.push(
          notificationRepository.create({
            userId: exampleUser.id,
            name: makeAcceptedName(),
            description: makeAcceptedDescription(fallbackProject),
            read: false,
          })
        );
        userStatusNotifications.push(
          notificationRepository.create({
            userId: exampleUser.id,
            name: makeRejectedName(),
            description: makeRejectedDescription(fallbackProject),
            read: false,
          })
        );
      }

      await notificationRepository.save(userStatusNotifications);

      // 3) Optional: Withdraw-Simulation (APPLICATION_WITHDRAWN) – NGO bekommt „zurückgezogen“
      //    (entspricht deleteApplicationById -> notify NGO)
      //    Wir erzeugen nur eine exemplarische „zurückgezogen“-Notification.
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
      console.log(`✅ Created ${users.length} users`);
      console.log(`✅ Created ${ngos.length} NGOs`);
      console.log(`✅ Created ${projects.length} projects`);
      console.log(`✅ Created ${savedApplications.length} applications with skills`);
      console.log(
        `✅ Created ${ngoAppliedNotifications.length} NGO application notifications (USER_APPLIED)`
      );
      console.log(
        `✅ Created ${userStatusNotifications.length} user status notifications (ACCEPTED/REJECTED)`
      );
      console.log(`✅ Created 1 NGO withdraw notification (APPLICATION_WITHDRAWN)`);
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
