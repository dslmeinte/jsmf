package nl.dslmeinte.jsmf.meta;

/*
 * Must be a separate Java enum (instead of an enum inside an Xtend file),
 * since Xtend doesn't pick up the static valueOf method of java.lang.Enum.
 */
public enum FeatureKind {

	attribute, containment, reference

}
