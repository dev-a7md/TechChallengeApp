import frappe
from frappe import delete_doc

def remove_rejected_candidates():
    filters = {
        'status': 'Rejected'
    }
    rejected_candidates_list = frappe.db.get_all('Candidate',filters,pluck = 'name')
    for candidate in rejected_candidates_list:
        delete_doc('Candidate',candidate,ignore_permissions=True)