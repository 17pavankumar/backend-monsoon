from django.contrib import admin
from community.models import CommunityReport
from community.models import ReportVote
from community.models import ReportComment
from community.models import CommunityChallenge
from community.models import ChallengeParticipation
# Register your models here.

admin.site.register(CommunityReport)
admin.site.register(ReportVote)
admin.site.register(ReportComment)
admin.site.register(CommunityChallenge)
admin.site.register(ChallengeParticipation)