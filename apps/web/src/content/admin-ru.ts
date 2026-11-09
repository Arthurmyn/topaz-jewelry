/**
 * Russian strings for the admin panel only. The storefront uses the dictionaries in
 * `content/dictionaries`. Admin is internal, so it stays Russian-only for now.
 */
export const ru = {
  admin: {
    title: "Панель управления",
    login: {
      title: "Вход в панель управления",
      email: "Email",
      password: "Пароль",
      submit: "Войти",
      failed: "Неверный email или пароль",
      notAdmin: "У этой учётной записи нет доступа",
    },
    logout: "Выйти",
    dashboard: "Обзор",
    dashboardText: "Выберите раздел слева.",
    loading: "Загрузка…",
    search: "Поиск",
    create: "Добавить",
    edit: "Изменить",
    delete: "Удалить",
    deleteConfirm: "Удалить запись? Это действие нельзя отменить.",
    save: "Сохранить",
    cancel: "Отмена",
    actions: "Действия",
    empty: "Записей нет",
    saved: "Сохранено",
    errors: {
      conflict: "Запись с такими данными уже существует",
      in_use: "Нельзя удалить: запись используется",
      validation_error: "Проверьте заполнение полей",
      csrf_failed: "Сессия устарела, обновите страницу",
      generic: "Не удалось выполнить действие",
    } as Record<string, string> & { generic: string },
    resources: {
      categories: {
        title: "Категории",
        fields: {
          name: "Название",
          slug: "Адрес (slug)",
          parent_id: "Родительская категория",
          description: "Описание",
          sort_order: "Порядок",
          is_active: "Активна",
          seo_title: "SEO заголовок",
          seo_description: "SEO описание",
        },
      },
      stones: {
        title: "Камни",
        fields: { name: "Название", slug: "Адрес (slug)" },
      },
      stores: {
        title: "Салоны",
        fields: {
          name: "Название",
          slug: "Адрес (slug)",
          city: "Город",
          address: "Адрес",
          phone: "Телефон",
          lat: "Широта",
          lng: "Долгота",
          description: "Описание",
          is_active: "Активен",
        },
      },
    },
  },
  catalog: {
    prev: "Назад",
    next: "Вперёд",
    page: (p: number, total: number) => `Страница ${p} из ${total}`,
  },
} as const;
