from types import SimpleNamespace

from utils.presentation_access import can_access_presentation


def _presentation(owner_user):
    return SimpleNamespace(owner_user=owner_user)


def test_admin_can_access_any_presentation():
    assert can_access_presentation(_presentation("worker"), "admin", "admin") is True


def test_user_can_only_access_owned_presentation():
    assert can_access_presentation(_presentation("worker"), "worker", "user") is True
    assert can_access_presentation(_presentation("other"), "worker", "user") is False
    assert can_access_presentation(_presentation(None), "worker", "user") is False
