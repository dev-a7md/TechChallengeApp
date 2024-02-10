import frappe

@frappe.whitelist(allow_guest= True)
def get_candidates():
    return frappe.db.get_all('Candidate', fields = '*')

@frappe.whitelist(allow_guest= True)
def create_candidate(**kwargs):
    candidate_meta = frappe.get_meta('Candidate')
    candidate_dict = {
        'doctype': 'Candidate'
    }
    for key,value in kwargs.items():
        if candidate_meta.has_field(key):
            candidate_dict[key] = value
    candidate_doc = frappe.get_doc(candidate_dict)
    try:
        candidate_doc.insert(ignore_permissions = True)
        return candidate_doc
    except Exception as e:
        return e

@frappe.whitelist(allow_guest = True)
def edit_candidates(**kwargs):
    candidate_dict = frappe._dict(kwargs)
    validate_candidate(candidate_dict)
    candidate_meta = frappe.get_meta('Candidate')
    candidate_doc = frappe.get_doc('Candidate',candidate_dict.candidate)
    for key,value in candidate_dict.items():
        if candidate_meta.has_field(key):
            candidate_doc.set(key, value)
    
    candidate_doc.save(ignore_permissions=True)
    return candidate_doc

def validate_candidate(candidate_dict):
    if not candidate_dict.candidate:
        frappe.throw("Candidate Is Required!")
    filters = {
        'name': candidate_dict.candidate
    }
    if not frappe.db.exists('Candidate',filters):
        frappe.throw(f'Candidate <b>{candidate_dict.candidate}</b> Does Not Exist!')