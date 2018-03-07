package gov.nih.nci.ctd2.dashboard.impl;

import gov.nih.nci.ctd2.dashboard.model.Subject;
import gov.nih.nci.ctd2.dashboard.model.Synonym;
import gov.nih.nci.ctd2.dashboard.model.Xref;
import org.hibernate.annotations.LazyCollection;
import org.hibernate.annotations.LazyCollectionOption;
import org.hibernate.annotations.Proxy;
import org.hibernate.search.annotations.Field;
import org.hibernate.search.annotations.Fields;
import org.hibernate.search.annotations.Indexed;
import org.hibernate.search.annotations.Analyze;
import org.hibernate.search.annotations.Store;

import javax.persistence.*;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Proxy(proxyClass = Subject.class)
@Table(name = "subject")
@Indexed
public class SubjectImpl extends DashboardEntityImpl implements Subject {
    private static final long serialVersionUID = 1L;
    public final static String FIELD_SYNONYM = "synonym";
    public final static String FIELD_SYNONYM_UT = "synonymUT";

    private Set<Synonym> synonyms = new LinkedHashSet<Synonym>();
    private Set<Xref> xrefs = new LinkedHashSet<Xref>();
    private Integer score = 0;
    private String stableURL = "";

    @LazyCollection(LazyCollectionOption.FALSE)
    @OneToMany(targetEntity = SynonymImpl.class, cascade = CascadeType.ALL)
    @JoinTable(name = "subject_synonym_map")
    public Set<Synonym> getSynonyms() {
        return synonyms;
    }

    public void setSynonyms(Set<Synonym> synonyms) {
        this.synonyms = synonyms;
    }

    @Fields({ @Field(name = FIELD_SYNONYM, index = org.hibernate.search.annotations.Index.YES, store = Store.YES),
            @Field(name = FIELD_SYNONYM_UT, index = org.hibernate.search.annotations.Index.YES, analyze = Analyze.NO) })
    @Transient
    public String getSynoynmStrings() {
        StringBuilder builder = new StringBuilder();
        for (Synonym synonym : getSynonyms()) {
            builder.append(synonym.getDisplayName()).append(" ");
        }
        return builder.toString();
    }

    @LazyCollection(LazyCollectionOption.FALSE)
    @OneToMany(targetEntity = XrefImpl.class, cascade = CascadeType.ALL)
    @JoinTable(name = "subject_xref_map")
    public Set<Xref> getXrefs() {
        return xrefs;
    }

    public void setXrefs(Set<Xref> xrefs) {
        this.xrefs = xrefs;
    }

    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    @Override
    public String getStableURL() {
        return stableURL;
    }

    protected void createURLWithPrefix(String prefix) {
        /* 
        The guideline requires the complete URL to be 100 characters or less.
        Considering the production URL starts with https://ctd2-dashboard.nci.nih.gov/dashboard/ of length 45,
        the maximum length the unique part is set to be 50.
        */
        final int MAX_LENGTH = 50;
        String stableURL = prefix + "/" + getDisplayName().toLowerCase().replaceAll("[^a-zA-Z0-9]", "-");
        if (stableURL.length() > MAX_LENGTH) {
            stableURL = stableURL.substring(0, MAX_LENGTH);
        }
        this.stableURL = stableURL;
    }

    @Override
    public void setStableURL(String url) {
        createURLWithPrefix("subject");
    }
}
