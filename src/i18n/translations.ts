export type Language = 'en' | 'fr' | 'nl' | 'de';

interface TranslationStructure {
  common: {
    inbox: string;
    tasks: string;
    items: string;
    notes: string;
    calendar: string;
    settings: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    add: string;
    create: string;
    search: string;
    filter: string;
    archive: string;
    logout: string;
    loading: string;
  };
  onboarding: {
    welcome: string;
    createAccount: string;
    getStarted: string;
  };
  tasks: {
    title: string;
    newTask: string;
    dueDate: string;
    assignee: string;
    labels: string;
    priority: string;
    status: string;
    completed: string;
    inProgress: string;
    todo: string;
  };
  items: {
    title: string;
    newItem: string;
    quantity: string;
    category: string;
  };
  notes: {
    title: string;
    newNote: string;
    content: string;
  };
  settings: {
    title: string;
    language: string;
    theme: string;
    notifications: string;
    account: string;
    archiveSettings: string;
    retentionPeriod: string;
    days30: string;
    days60: string;
    days90: string;
    unlimited: string;
    autoCleanup: string;
    sprintSettings: string;
    sprintStartDay: string;
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  projects: {
    title: string;
    newProject: string;
    createProject: string;
    projectName: string;
    description: string;
    color: string;
    progress: string;
    tasksCompleted: string;
    tasks: string;
    subtasks: string;
    noProjects: string;
    noProjectsSub: string;
    noTasks: string;
    backToOverview: string;
    statusActive: string;
    statusCompleted: string;
    statusArchived: string;
  };
  invite: {
    generate: string;
    share: string;
    delete: string;
    copyUrl: string;
    close: string;
    urlCopied: string;
    codeDeleted: string;
    expired: string;
    usedOn: string;
    minutesRemaining: string;
    shareViaWhatsApp: string;
    shareInvite: string;
  };
}

export const translations: Record<Language, TranslationStructure> = {
  en: {
    common: {
      inbox: 'Inbox',
      tasks: 'Tasks',
      items: 'Items',
      notes: 'Notes',
      calendar: 'Calendar',
      settings: 'Settings',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      create: 'Create',
      search: 'Search',
      filter: 'Filter',
      archive: 'Archive',
      logout: 'Logout',
      loading: 'Loading...',
    },
    onboarding: {
      welcome: 'Welcome to todoless-ngx',
      createAccount: 'Create Account',
      getStarted: 'Get Started',
    },
    tasks: {
      title: 'Tasks',
      newTask: 'New Task',
      dueDate: 'Due Date',
      assignee: 'Assignee',
      labels: 'Labels',
      priority: 'Priority',
      status: 'Status',
      completed: 'Completed',
      inProgress: 'In Progress',
      todo: 'To Do',
    },
    items: {
      title: 'Items',
      newItem: 'New Item',
      quantity: 'Quantity',
      category: 'Category',
    },
    notes: {
      title: 'Notes',
      newNote: 'New Note',
      content: 'Content',
    },
    invite: {
      generate: 'Generate Invite Code',
      share: 'Share',
      delete: 'Delete',
      copyUrl: 'Copy URL',
      close: 'Close',
      urlCopied: 'URL copied!',
      codeDeleted: 'Invite code deleted',
      expired: 'Expired',
      usedOn: 'Used on {date}',
      minutesRemaining: '{n} minutes remaining',
      shareViaWhatsApp: 'Share via WhatsApp',
      shareInvite: 'Share Invite',
    },
    settings: {
      title: 'Settings',
      language: 'Language',
      theme: 'Theme',
      notifications: 'Notifications',
      account: 'Account',
      archiveSettings: 'Archive Settings',
      retentionPeriod: 'Retention Period',
      days30: '30 days',
      days60: '60 days',
      days90: '90 days',
      unlimited: 'Unlimited',
      autoCleanup: 'Auto Cleanup',
      sprintSettings: 'Sprint Settings',
      sprintStartDay: 'Sprint Start Day',
      monday: 'Monday',
      tuesday: 'Tuesday',
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday',
      sunday: 'Sunday',
    },
    projects: {
      title: 'Projects',
      newProject: 'New Project',
      createProject: 'Create Project',
      projectName: 'Project name',
      description: 'Description',
      color: 'Color',
      progress: 'Progress',
      tasksCompleted: 'tasks completed',
      tasks: 'tasks',
      subtasks: 'Sub-tasks',
      noProjects: 'No projects yet',
      noProjectsSub: 'Create your first project to get started',
      noTasks: 'No sub-tasks in this project',
      backToOverview: 'Back to overview',
      statusActive: 'Active',
      statusCompleted: 'Completed',
      statusArchived: 'Archived',
    },
  },
  fr: {
    common: {
      inbox: 'Boîte de réception',
      tasks: 'Tâches',
      items: 'Articles',
      notes: 'Notes',
      calendar: 'Calendrier',
      settings: 'Paramètres',
      save: 'Enregistrer',
      cancel: 'Annuler',
      delete: 'Supprimer',
      edit: 'Modifier',
      add: 'Ajouter',
      create: 'Créer',
      search: 'Rechercher',
      filter: 'Filtrer',
      archive: 'Archiver',
      logout: 'Déconnexion',
      loading: 'Chargement...',
    },
    onboarding: {
      welcome: 'Bienvenue sur todoless-ngx',
      createAccount: 'Créer un compte',
      getStarted: 'Commencer',
    },
    tasks: {
      title: 'Tâches',
      newTask: 'Nouvelle tâche',
      dueDate: 'Date d\'échéance',
      assignee: 'Assigné à',
      labels: 'Étiquettes',
      priority: 'Priorité',
      status: 'Statut',
      completed: 'Terminé',
      inProgress: 'En cours',
      todo: 'À faire',
    },
    items: {
      title: 'Articles',
      newItem: 'Nouvel article',
      quantity: 'Quantité',
      category: 'Catégorie',
    },
    notes: {
      title: 'Notes',
      newNote: 'Nouvelle note',
      content: 'Contenu',
    },
    invite: {
      generate: "Générer un code d'invitation",
      share: 'Partager',
      delete: 'Supprimer',
      copyUrl: "Copier l'URL",
      close: 'Fermer',
      urlCopied: 'URL copiée !',
      codeDeleted: "Code d'invitation supprimé",
      expired: 'Expiré',
      usedOn: 'Utilisé le {date}',
      minutesRemaining: 'Encore {n} minutes',
      shareViaWhatsApp: 'Partager via WhatsApp',
      shareInvite: "Partager l'invitation",
    },
    settings: {
      title: 'Paramètres',
      language: 'Langue',
      theme: 'Thème',
      notifications: 'Notifications',
      account: 'Compte',
      archiveSettings: 'Paramètres d\'archivage',
      retentionPeriod: 'Période de conservation',
      days30: '30 jours',
      days60: '60 jours',
      days90: '90 jours',
      unlimited: 'Illimité',
      autoCleanup: 'Nettoyage automatique',
      sprintSettings: 'Paramètres de sprint',
      sprintStartDay: 'Jour de début du sprint',
      monday: 'Lundi',
      tuesday: 'Mardi',
      wednesday: 'Mercredi',
      thursday: 'Jeudi',
      friday: 'Vendredi',
      saturday: 'Samedi',
      sunday: 'Dimanche',
    },
    projects: {
      title: 'Projets',
      newProject: 'Nouveau projet',
      createProject: 'Créer un projet',
      projectName: 'Nom du projet',
      description: 'Description',
      color: 'Couleur',
      progress: 'Progrès',
      tasksCompleted: 'tâches terminées',
      tasks: 'tâches',
      subtasks: 'Sous-tâches',
      noProjects: 'Pas encore de projets',
      noProjectsSub: 'Créez votre premier projet pour commencer',
      noTasks: 'Pas de sous-tâches dans ce projet',
      backToOverview: "Retour à l'aperçu",
      statusActive: 'Actif',
      statusCompleted: 'Terminé',
      statusArchived: 'Archivé',
    },
  },
  nl: {
    common: {
      inbox: 'Inbox',
      tasks: 'Taken',
      items: 'Items',
      notes: 'Notities',
      calendar: 'Kalender',
      settings: 'Instellingen',
      save: 'Opslaan',
      cancel: 'Annuleren',
      delete: 'Verwijderen',
      edit: 'Bewerken',
      add: 'Toevoegen',
      create: 'Aanmaken',
      search: 'Zoeken',
      filter: 'Filteren',
      archive: 'Archiveren',
      logout: 'Uitloggen',
      loading: 'Laden...',
    },
    onboarding: {
      welcome: 'Welkom bij todoless-ngx',
      createAccount: 'Account aanmaken',
      getStarted: 'Aan de slag',
    },
    tasks: {
      title: 'Taken',
      newTask: 'Nieuwe taak',
      dueDate: 'Verloopdatum',
      assignee: 'Toegewezen aan',
      labels: 'Labels',
      priority: 'Prioriteit',
      status: 'Status',
      completed: 'Voltooid',
      inProgress: 'Bezig',
      todo: 'Te doen',
    },
    items: {
      title: 'Items',
      newItem: 'Nieuw item',
      quantity: 'Hoeveelheid',
      category: 'Categorie',
    },
    notes: {
      title: 'Notities',
      newNote: 'Nieuwe notitie',
      content: 'Inhoud',
    },
    invite: {
      generate: 'Genereer Invite Code',
      share: 'Delen',
      delete: 'Verwijderen',
      copyUrl: 'Kopieer URL',
      close: 'Sluiten',
      urlCopied: 'URL gekopieerd!',
      codeDeleted: 'Invite code verwijderd',
      expired: 'Verlopen',
      usedOn: 'Gebruikt op {date}',
      minutesRemaining: 'Nog {n} minuten geldig',
      shareViaWhatsApp: 'Delen via WhatsApp',
      shareInvite: 'Deel Invite',
    },
    settings: {
      title: 'Instellingen',
      language: 'Taal',
      theme: 'Thema',
      notifications: 'Meldingen',
      account: 'Account',
      archiveSettings: 'Archief instellingen',
      retentionPeriod: 'Bewaarperiode',
      days30: '30 dagen',
      days60: '60 dagen',
      days90: '90 dagen',
      unlimited: 'Onbeperkt',
      autoCleanup: 'Automatisch opruimen',
      sprintSettings: 'Sprint instellingen',
      sprintStartDay: 'Sprint startdag',
      monday: 'Maandag',
      tuesday: 'Dinsdag',
      wednesday: 'Woensdag',
      thursday: 'Donderdag',
      friday: 'Vrijdag',
      saturday: 'Zaterdag',
      sunday: 'Zondag',
    },
    projects: {
      title: 'Projecten',
      newProject: 'Nieuw project',
      createProject: 'Project aanmaken',
      projectName: 'Projectnaam',
      description: 'Beschrijving',
      color: 'Kleur',
      progress: 'Voortgang',
      tasksCompleted: 'taken voltooid',
      tasks: 'taken',
      subtasks: 'Sub-taken',
      noProjects: 'Nog geen projecten',
      noProjectsSub: 'Maak je eerste project om te beginnen',
      noTasks: 'Geen sub-taken in dit project',
      backToOverview: 'Terug naar overzicht',
      statusActive: 'Actief',
      statusCompleted: 'Voltooid',
      statusArchived: 'Gearchiveerd',
    },
  },
  de: {
    common: {
      inbox: 'Posteingang',
      tasks: 'Aufgaben',
      items: 'Artikel',
      notes: 'Notizen',
      calendar: 'Kalender',
      settings: 'Einstellungen',
      save: 'Speichern',
      cancel: 'Abbrechen',
      delete: 'Löschen',
      edit: 'Bearbeiten',
      add: 'Hinzufügen',
      create: 'Erstellen',
      search: 'Suchen',
      filter: 'Filtern',
      archive: 'Archivieren',
      logout: 'Abmelden',
      loading: 'Laden...',
    },
    onboarding: {
      welcome: 'Willkommen bei todoless-ngx',
      createAccount: 'Konto erstellen',
      getStarted: 'Loslegen',
    },
    tasks: {
      title: 'Aufgaben',
      newTask: 'Neue Aufgabe',
      dueDate: 'Fälligkeitsdatum',
      assignee: 'Zugewiesen an',
      labels: 'Etiketten',
      priority: 'Priorität',
      status: 'Status',
      completed: 'Abgeschlossen',
      inProgress: 'In Bearbeitung',
      todo: 'Zu erledigen',
    },
    items: {
      title: 'Artikel',
      newItem: 'Neuer Artikel',
      quantity: 'Menge',
      category: 'Kategorie',
    },
    notes: {
      title: 'Notizen',
      newNote: 'Neue Notiz',
      content: 'Inhalt',
    },
    invite: {
      generate: 'Einladungscode generieren',
      share: 'Teilen',
      delete: 'Löschen',
      copyUrl: 'URL kopieren',
      close: 'Schließen',
      urlCopied: 'URL kopiert!',
      codeDeleted: 'Einladungscode gelöscht',
      expired: 'Abgelaufen',
      usedOn: 'Verwendet am {date}',
      minutesRemaining: 'Noch {n} Minuten',
      shareViaWhatsApp: 'Über WhatsApp teilen',
      shareInvite: 'Einladung teilen',
    },
    settings: {
      title: 'Einstellungen',
      language: 'Sprache',
      theme: 'Design',
      notifications: 'Benachrichtigungen',
      account: 'Konto',
      archiveSettings: 'Archiveinstellungen',
      retentionPeriod: 'Aufbewahrungsdauer',
      days30: '30 Tage',
      days60: '60 Tage',
      days90: '90 Tage',
      unlimited: 'Unbegrenzt',
      autoCleanup: 'Automatische Bereinigung',
      sprintSettings: 'Sprint-Einstellungen',
      sprintStartDay: 'Sprint-Starttag',
      monday: 'Montag',
      tuesday: 'Dienstag',
      wednesday: 'Mittwoch',
      thursday: 'Donnerstag',
      friday: 'Freitag',
      saturday: 'Samstag',
      sunday: 'Sonntag',
    },
    projects: {
      title: 'Projekte',
      newProject: 'Neues Projekt',
      createProject: 'Projekt erstellen',
      projectName: 'Projektname',
      description: 'Beschreibung',
      color: 'Farbe',
      progress: 'Fortschritt',
      tasksCompleted: 'Aufgaben abgeschlossen',
      tasks: 'Aufgaben',
      subtasks: 'Teilaufgaben',
      noProjects: 'Noch keine Projekte',
      noProjectsSub: 'Erstellen Sie Ihr erstes Projekt',
      noTasks: 'Keine Teilaufgaben in diesem Projekt',
      backToOverview: 'Zurück zur Übersicht',
      statusActive: 'Aktiv',
      statusCompleted: 'Abgeschlossen',
      statusArchived: 'Archiviert',
    },
  },
};

/** Simple translation helper: looks up nested key in language dict. */
export function t(key: string, lang: Language = 'en'): string {
  const dict = translations[lang] ?? translations['en'];
  const parts = key.split('.');
  let value: any = dict;
  for (const part of parts) {
    if (value && typeof value === 'object' && part in value) {
      value = value[part];
    } else {
      return key;
    }
  }
  return typeof value === 'string' ? value : key;
}
