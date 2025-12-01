from rest_framework import permissions

# Rule: Sales wale sab kar sakte hain, Tech wale sirf dekh sakte hain
class IsSalesTeamOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        # Agar user bas dekhna chahta hai (GET), toh sabko allowed hai
        if request.method in permissions.SAFE_METHODS:
            return True
        # Agar Edit/Delete/Add karna hai, toh Group 'Sales' hona chahiye ya Superuser
        return request.user.groups.filter(name='Sales').exists() or request.user.is_superuser

# Rule: Tech wale sab kar sakte hain, Sales wale sirf dekh sakte hain
class IsTechTeamOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        # Agar Edit/Delete/Add karna hai, toh Group 'Tech' hona chahiye ya Superuser
        return request.user.groups.filter(name='Tech').exists() or request.user.is_superuser