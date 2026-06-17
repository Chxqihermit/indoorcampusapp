import { Building2, ChevronUp, Mail, MapPin, Navigation, UserRound, X } from "lucide-react";

function staffInitials(name) {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function StaffDetailCard({
  staff,
  collapsed = false,
  sheet = false,
  onClose,
  onDirections,
  onToggle
}) {
  if (!staff) return null;

  const buildingLine = [staff.buildingName, staff.roomNo ? `Room ${staff.roomNo}` : ""]
    .filter(Boolean)
    .join(" · ");

  if (collapsed) {
    return (
      <button
        type="button"
        className={`staff-detail-card staff-detail-card--collapsed ${sheet ? "staff-detail-card--sheet" : ""}`}
        onClick={onToggle}
        aria-expanded="false"
        aria-label={`Show details for ${staff.name}`}
      >
        <div className="staff-detail-card__peek">
          <div className="staff-detail-card__peek-avatar">{staffInitials(staff.name)}</div>
          <span className="staff-detail-card__peek-name">{staff.name}</span>
          <ChevronUp className="w-5 h-5 text-gray-500 shrink-0" />
        </div>
      </button>
    );
  }

  return (
    <div
      className={`staff-detail-card ${sheet ? "staff-detail-card--sheet" : ""}`}
      role="dialog"
      aria-label={`${staff.name} details`}
    >
      <button type="button" className="staff-detail-card__close" onClick={onClose} aria-label="Close">
        <X className="w-4 h-4" />
      </button>

      {sheet && (
        <button type="button" className="staff-detail-card__grab" onClick={onToggle} aria-label="Minimize">
          <span className="staff-detail-card__grab-bar" />
        </button>
      )}

      <div className="staff-detail-card__hero">
        <div className="staff-detail-card__avatar">{staffInitials(staff.name)}</div>
      </div>

      <div className="staff-detail-card__body">
        <h2 className="staff-detail-card__name">{staff.name}</h2>

        {staff.staffPosition && (
          <p className="staff-detail-card__role">{staff.staffPosition}</p>
        )}

        {buildingLine && (
          <div className="staff-detail-card__row">
            <Building2 className="w-4 h-4 shrink-0 text-gray-500" />
            <span>{buildingLine}</span>
          </div>
        )}

        {staff.email && (
          <a className="staff-detail-card__row staff-detail-card__link" href={`mailto:${staff.email}`}>
            <Mail className="w-4 h-4 shrink-0 text-gray-500" />
            <span>{staff.email}</span>
          </a>
        )}

        <div className="staff-detail-card__actions">
          <button type="button" className="staff-detail-card__directions" onClick={onDirections}>
            <Navigation className="w-5 h-5" />
            <span>Directions</span>
          </button>
          <div className="staff-detail-card__meta">
            <UserRound className="w-4 h-4 text-brand" />
            <span>Staff member</span>
          </div>
        </div>

        {staff.subtitle && (
          <div className="staff-detail-card__footnote">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span>{staff.subtitle}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export { StaffDetailCard as default, staffInitials };
