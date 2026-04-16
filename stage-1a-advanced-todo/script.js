const app = document.getElementById("app");

const DESCRIPTION_COLLAPSE_LENGTH = 140;

const state = {
  task: {
    title: "Finish internship task submission",
    description:
      "Build a polished, accessible Todo Item Card with exact test IDs, responsive layout, synced status and checkbox behavior, edit mode, expand and collapse support, and richer time logic for the Stage 1A task.",
    priority: "High",
    dueDate: createFutureLocalDateTime(3, 2),
    status: "In Progress",
    tags: ["work", "urgent", "design"],
  },
  editing: false,
  expanded: false,
  editDraft: null,
};

function createFutureLocalDateTime(daysFromNow, hourOffset = 0) {
  const now = new Date();
  const future = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + daysFromNow,
    now.getHours() + hourOffset,
    now.getMinutes(),
    0,
    0
  );
  return toLocalDatetimeInputValue(future);
}

function parseLocalDateTime(value) {
  return new Date(value);
}

function toLocalDatetimeInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function formatDueDate(value) {
  const date = parseLocalDateTime(value);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function getTimeRemainingInfo(dueDateValue, status) {
  if (status === "Done") {
    return {
      text: "Completed",
      overdue: false,
      showOverdue: false,
    };
  }

  const now = new Date();
  const dueDate = parseLocalDateTime(dueDateValue);
  const diffMs = dueDate.getTime() - now.getTime();

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (Math.abs(diffMs) < minute) {
    return {
      text: "Due now!",
      overdue: false,
      showOverdue: false,
    };
  }

  if (diffMs < 0) {
    const overdueMs = Math.abs(diffMs);

    if (overdueMs < hour) {
      const minutes = Math.max(1, Math.floor(overdueMs / minute));
      return {
        text: `Overdue by ${minutes} minute${minutes > 1 ? "s" : ""}`,
        overdue: true,
        showOverdue: true,
      };
    }

    if (overdueMs < day) {
      const hours = Math.max(1, Math.floor(overdueMs / hour));
      return {
        text: `Overdue by ${hours} hour${hours > 1 ? "s" : ""}`,
        overdue: true,
        showOverdue: true,
      };
    }

    const days = Math.max(1, Math.floor(overdueMs / day));
    return {
      text: `Overdue by ${days} day${days > 1 ? "s" : ""}`,
      overdue: true,
      showOverdue: true,
    };
  }

  if (diffMs < hour) {
    const minutes = Math.max(1, Math.floor(diffMs / minute));
    return {
      text: `Due in ${minutes} minute${minutes > 1 ? "s" : ""}`,
      overdue: false,
      showOverdue: false,
    };
  }

  if (diffMs < day) {
    const hours = Math.max(1, Math.floor(diffMs / hour));
    return {
      text: `Due in ${hours} hour${hours > 1 ? "s" : ""}`,
      overdue: false,
      showOverdue: false,
    };
  }

  const days = Math.ceil(diffMs / day);

  if (days === 1) {
    return {
      text: "Due tomorrow",
      overdue: false,
      showOverdue: false,
    };
  }

  return {
    text: `Due in ${days} days`,
    overdue: false,
    showOverdue: false,
  };
}

function getPriorityClass(priority) {
  return priority.toLowerCase();
}

function getStatusClass(status) {
  return status.toLowerCase().replace(/\s+/g, "-");
}

function shouldCollapseDescription(description) {
  return description.length > DESCRIPTION_COLLAPSE_LENGTH;
}

function getDisplayDescription(description, expanded) {
  if (!shouldCollapseDescription(description) || expanded) {
    return description;
  }

  return `${description.slice(0, DESCRIPTION_COLLAPSE_LENGTH).trim()}...`;
}

function getCheckboxChecked(status) {
  return status === "Done";
}

function syncStatusFromCheckbox(checked) {
  state.task.status = checked ? "Done" : "Pending";
}

function render() {
  const { task, editing, expanded, editDraft } = state;
  const timeInfo = getTimeRemainingInfo(task.dueDate, task.status);
  const checkboxChecked = getCheckboxChecked(task.status);
  const collapsibleId = "todo-collapsible-section";

  app.innerHTML = `
    <article
      class="todo-card ${timeInfo.overdue ? "todo-card--overdue" : ""}"
      data-testid="test-todo-card"
      aria-label="Advanced todo task card"
    >
      <div
        class="todo-card__priority-accent todo-card__priority-accent--${getPriorityClass(
          task.priority
        )}"
        data-testid="test-todo-priority-indicator"
        aria-label="Priority indicator: ${task.priority}"
      ></div>

      <div class="todo-card__top">
        <div class="todo-card__left">
          <div class="todo-card__checkbox-group">
            <input
              id="todo-complete-toggle"
              type="checkbox"
              data-testid="test-todo-complete-toggle"
              aria-label="${
                checkboxChecked
                  ? "Mark task as incomplete"
                  : "Mark task as complete"
              }"
              ${checkboxChecked ? "checked" : ""}
            />
            <label for="todo-complete-toggle" class="todo-card__checkbox-label">
              ${checkboxChecked ? "Completed" : "Complete task"}
            </label>
          </div>

          <div class="todo-card__priority-wrap">
            <span
              class="todo-card__priority-indicator todo-card__priority-indicator--${getPriorityClass(
                task.priority
              )}"
              aria-hidden="true"
            ></span>
            <span
              class="todo-badge todo-badge--${getPriorityClass(task.priority)}"
              data-testid="test-todo-priority"
              aria-label="Priority: ${task.priority}"
            >
              ${task.priority}
            </span>
          </div>
        </div>
      </div>

      ${
        editing
          ? renderEditForm(editDraft || task)
          : `
        <h2
          class="todo-card__title ${
            task.status === "Done" ? "todo-card__title--done" : ""
          }"
          data-testid="test-todo-title"
        >
          ${escapeHtml(task.title)}
        </h2>

        <div class="todo-card__description-wrap">
          <div
            class="todo-card__collapsible"
            data-testid="test-todo-collapsible-section"
            id="${collapsibleId}"
          >
            <p
              class="todo-card__description ${
                task.status === "Done" ? "todo-card__description--muted" : ""
              }"
              data-testid="test-todo-description"
            >
              ${escapeHtml(getDisplayDescription(task.description, expanded))}
            </p>
          </div>

          ${
            shouldCollapseDescription(task.description)
              ? `
            <button
              type="button"
              class="todo-card__expand-button"
              data-testid="test-todo-expand-toggle"
              aria-expanded="${expanded}"
              aria-controls="${collapsibleId}"
            >
              ${expanded ? "Show less" : "Show more"}
            </button>
          `
              : `
            <button
              type="button"
              class="todo-card__expand-button"
              data-testid="test-todo-expand-toggle"
              aria-expanded="true"
              aria-controls="${collapsibleId}"
              hidden
            >
              Show more
            </button>
          `
          }
        </div>

        <div class="todo-card__status-row">
          <span class="todo-card__label">Status</span>

          <div class="todo-card__status-layout">
            <span
              class="todo-badge todo-badge--${getStatusClass(task.status)}"
              data-testid="test-todo-status"
              aria-label="Status: ${task.status}"
            >
              ${task.status}
            </span>

            <select
              class="todo-card__status-control"
              data-testid="test-todo-status-control"
              aria-label="Task status control"
            >
              <option value="Pending" ${
                task.status === "Pending" ? "selected" : ""
              }>Pending</option>
              <option value="In Progress" ${
                task.status === "In Progress" ? "selected" : ""
              }>In Progress</option>
              <option value="Done" ${
                task.status === "Done" ? "selected" : ""
              }>Done</option>
            </select>
          </div>
        </div>

        <div class="todo-card__meta-grid">
          <div class="todo-card__meta-item">
            <span class="todo-card__label">Due date</span>
            <time
              class="todo-card__meta-value"
              datetime="${parseLocalDateTime(task.dueDate).toISOString()}"
              data-testid="test-todo-due-date"
            >
              Due ${escapeHtml(formatDueDate(task.dueDate))}
            </time>
          </div>

          <div class="todo-card__meta-item">
            <span class="todo-card__label">Time remaining</span>
            <time
              class="todo-card__meta-value"
              data-testid="test-todo-time-remaining"
              aria-live="polite"
              datetime="${parseLocalDateTime(task.dueDate).toISOString()}"
            >
              ${escapeHtml(timeInfo.text)}
            </time>
          </div>
        </div>

        ${
          timeInfo.showOverdue
            ? `
          <span
            class="todo-card__overdue"
            data-testid="test-todo-overdue-indicator"
            aria-label="Overdue task"
          >
            Overdue
          </span>
        `
            : ""
        }

        <div class="todo-card__tags-section">
          <span class="todo-card__label">Tags</span>

          <ul
            class="todo-card__tags"
            data-testid="test-todo-tags"
            role="list"
            aria-label="Task tags"
          >
            ${task.tags
              .map(
                (tag) => `
              <li
                class="todo-card__tag"
                data-testid="test-todo-tag-${escapeAttribute(tag)}"
              >
                ${escapeHtml(tag)}
              </li>
            `
              )
              .join("")}
          </ul>
        </div>

        <div class="todo-card__actions">
          <button
            type="button"
            class="todo-card__action-button todo-card__action-button--edit"
            data-testid="test-todo-edit-button"
          >
            Edit
          </button>

          <button
            type="button"
            class="todo-card__action-button todo-card__action-button--delete"
            data-testid="test-todo-delete-button"
          >
            Delete
          </button>
        </div>
      `
      }
    </article>
  `;

  attachEventListeners();
}

function renderEditForm(draft) {
  return `
    <form
      class="todo-card__edit-form"
      data-testid="test-todo-edit-form"
      novalidate
    >
      <div class="todo-card__field-group">
        <label for="edit-title">Title</label>
        <input
          id="edit-title"
          type="text"
          value="${escapeAttribute(draft.title)}"
          data-testid="test-todo-edit-title-input"
        />
      </div>

      <div class="todo-card__field-group">
        <label for="edit-description">Description</label>
        <textarea
          id="edit-description"
          data-testid="test-todo-edit-description-input"
        >${escapeHtml(draft.description)}</textarea>
      </div>

      <div class="todo-card__field-group">
        <label for="edit-priority">Priority</label>
        <select
          id="edit-priority"
          data-testid="test-todo-edit-priority-select"
        >
          <option value="Low" ${
            draft.priority === "Low" ? "selected" : ""
          }>Low</option>
          <option value="Medium" ${
            draft.priority === "Medium" ? "selected" : ""
          }>Medium</option>
          <option value="High" ${
            draft.priority === "High" ? "selected" : ""
          }>High</option>
        </select>
      </div>

      <div class="todo-card__field-group">
        <label for="edit-due-date">Due date</label>
        <input
          id="edit-due-date"
          type="datetime-local"
          value="${escapeAttribute(draft.dueDate)}"
          data-testid="test-todo-edit-due-date-input"
        />
      </div>

      <div class="todo-card__form-actions">
        <button
          type="submit"
          class="todo-card__save-button"
          data-testid="test-todo-save-button"
        >
          Save
        </button>

        <button
          type="button"
          class="todo-card__cancel-button"
          data-testid="test-todo-cancel-button"
        >
          Cancel
        </button>
      </div>
    </form>
  `;
}

function attachEventListeners() {
  const checkbox = app.querySelector('[data-testid="test-todo-complete-toggle"]');
  const statusControl = app.querySelector('[data-testid="test-todo-status-control"]');
  const expandToggle = app.querySelector('[data-testid="test-todo-expand-toggle"]');
  const editButton = app.querySelector('[data-testid="test-todo-edit-button"]');
  const deleteButton = app.querySelector('[data-testid="test-todo-delete-button"]');
  const editForm = app.querySelector('[data-testid="test-todo-edit-form"]');

  if (checkbox) {
    checkbox.addEventListener("change", (event) => {
      syncStatusFromCheckbox(event.target.checked);
      render();
    });
  }

  if (statusControl) {
    statusControl.addEventListener("change", (event) => {
      state.task.status = event.target.value;
      render();
    });
  }

  if (expandToggle && !expandToggle.hidden) {
    expandToggle.addEventListener("click", () => {
      state.expanded = !state.expanded;
      render();
    });
  }

  if (editButton) {
    editButton.addEventListener("click", () => {
      state.editing = true;
      state.editDraft = { ...state.task };
      render();

      const firstInput = app.querySelector('[data-testid="test-todo-edit-title-input"]');
      if (firstInput) {
        firstInput.focus();
      }
    });
  }

  if (deleteButton) {
    deleteButton.addEventListener("click", () => {
      window.alert("Delete clicked");
    });
  }

  if (editForm) {
    const titleInput = app.querySelector('[data-testid="test-todo-edit-title-input"]');
    const descriptionInput = app.querySelector(
      '[data-testid="test-todo-edit-description-input"]'
    );
    const prioritySelect = app.querySelector(
      '[data-testid="test-todo-edit-priority-select"]'
    );
    const dueDateInput = app.querySelector(
      '[data-testid="test-todo-edit-due-date-input"]'
    );
    const cancelButton = app.querySelector('[data-testid="test-todo-cancel-button"]');

    titleInput.addEventListener("input", (event) => {
      state.editDraft.title = event.target.value;
    });

    descriptionInput.addEventListener("input", (event) => {
      state.editDraft.description = event.target.value;
    });

    prioritySelect.addEventListener("change", (event) => {
      state.editDraft.priority = event.target.value;
    });

    dueDateInput.addEventListener("input", (event) => {
      state.editDraft.dueDate = event.target.value;
    });

    editForm.addEventListener("submit", (event) => {
      event.preventDefault();

      state.task = {
        ...state.task,
        title: state.editDraft.title.trim() || state.task.title,
        description: state.editDraft.description.trim() || state.task.description,
        priority: state.editDraft.priority,
        dueDate: state.editDraft.dueDate || state.task.dueDate,
      };

      state.editing = false;
      state.editDraft = null;
      render();

      const editBtn = app.querySelector('[data-testid="test-todo-edit-button"]');
      if (editBtn) {
        editBtn.focus();
      }
    });

    cancelButton.addEventListener("click", () => {
      state.editing = false;
      state.editDraft = null;
      render();

      const editBtn = app.querySelector('[data-testid="test-todo-edit-button"]');
      if (editBtn) {
        editBtn.focus();
      }
    });
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttribute(value) {
  return escapeHtml(value);
}

render();

window.setInterval(() => {
  if (state.task.status !== "Done" && !state.editing) {
    render();
  }
}, 30000);