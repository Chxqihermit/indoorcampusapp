import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Building2, Mail, MapPin, Navigation, UserRound, X } from "lucide-react";

const PEEK_HEIGHT = 60;
const DISMISS_DRAG = 90;

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
  onToggle,
  onCollapse,
  onExpand
}) {
  const sheetRef = useRef(null);
  const [sheetHeight, setSheetHeight] = useState(0);
  const [dragTranslate, setDragTranslate] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({
    active: false,
    startY: 0,
    startTranslate: 0,
    pointerId: null
  });

  const collapse = onCollapse ?? (() => onToggle?.());
  const expand = onExpand ?? (() => onToggle?.());

  useLayoutEffect(() => {
    if (!sheet || !sheetRef.current) return;
    const node = sheetRef.current;
    const measure = () => setSheetHeight(node.offsetHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [sheet, staff]);

  const collapsedOffset = Math.max(0, sheetHeight - PEEK_HEIGHT);
  const restingTranslate = collapsed ? collapsedOffset : 0;
  const translateY = dragTranslate ?? restingTranslate;

  useEffect(() => {
    if (!dragRef.current.active) {
      setDragTranslate(null);
    }
  }, [collapsed]);

  const finishDrag = useCallback((currentTranslate) => {
    dragRef.current.active = false;
    setIsDragging(false);
    setDragTranslate(null);

    if (collapsedOffset <= 0) return;

    const snapMid = collapsedOffset * 0.42;

    if (currentTranslate >= snapMid) {
      if (collapsed && currentTranslate > collapsedOffset + DISMISS_DRAG) {
        onClose?.();
      } else {
        collapse();
      }
    } else {
      expand();
    }
  }, [collapsed, collapsedOffset, collapse, expand, onClose]);

  const onPointerDown = useCallback((event) => {
    if (!sheet || collapsedOffset <= 0) return;
    if (event.button !== 0 && event.pointerType === "mouse") return;

    dragRef.current = {
      active: true,
      startY: event.clientY,
      startTranslate: dragTranslate ?? restingTranslate,
      pointerId: event.pointerId
    };
    setIsDragging(true);

    event.currentTarget.setPointerCapture(event.pointerId);
    setDragTranslate(dragRef.current.startTranslate);
  }, [sheet, collapsedOffset, dragTranslate, restingTranslate]);

  const onPointerMove = useCallback((event) => {
    if (!dragRef.current.active) return;

    const delta = event.clientY - dragRef.current.startY;
    const maxDown = collapsedOffset + (collapsed ? DISMISS_DRAG : 48);
    const next = Math.max(-24, Math.min(maxDown, dragRef.current.startTranslate + delta));
    setDragTranslate(next);
  }, [collapsed, collapsedOffset]);

  const onPointerUp = useCallback((event) => {
    if (!dragRef.current.active) return;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    finishDrag(dragTranslate ?? dragRef.current.startTranslate);
  }, [dragTranslate, finishDrag]);

  const onPointerCancel = useCallback((event) => {
    if (!dragRef.current.active) return;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    dragRef.current.active = false;
    setIsDragging(false);
    setDragTranslate(null);
  }, []);

  if (!staff) return null;

  const buildingLine = [staff.buildingName, staff.roomNo ? `Room ${staff.roomNo}` : ""]
    .filter(Boolean)
    .join(" · ");

  if (sheet) {
    return (
      <div
        ref={sheetRef}
        className={`staff-detail-card staff-detail-card--sheet ${collapsed ? "staff-detail-card--collapsed" : ""} ${isDragging ? "staff-detail-card--dragging" : ""}`}
        role="dialog"
        aria-label={`${staff.name} details`}
        style={{
          transform: `translateY(${translateY}px)`
        }}
      >
        <div
          className="staff-detail-card__sheet-header"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
        >
          <div className="staff-detail-card__grab" aria-hidden="true">
            <span className="staff-detail-card__grab-bar" />
          </div>
          <div className="staff-detail-card__peek">
            <div className="staff-detail-card__peek-avatar">{staffInitials(staff.name)}</div>
            <span className="staff-detail-card__peek-name">{staff.name}</span>
          </div>
          <button
            type="button"
            className="staff-detail-card__close staff-detail-card__close--sheet"
            onClick={onClose}
            onPointerDown={(event) => event.stopPropagation()}
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

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

  return (
    <div
      className="staff-detail-card"
      role="dialog"
      aria-label={`${staff.name} details`}
    >
      <button type="button" className="staff-detail-card__close" onClick={onClose} aria-label="Close">
        <X className="w-4 h-4" />
      </button>

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
